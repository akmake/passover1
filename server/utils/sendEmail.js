import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1. הגדרת ה-"transporter" - השירות שדרכו נשלח את המייל
    // הוא ישתמש בפרטים שהגדרת ב- .env
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 2. הגדרת פרטי המייל
    const mailOptions = {
        from: '"קייטרינג פלוס" <no-reply@cateringplus.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: '<b>אפשר גם לשלוח HTML</b>' // אפשר להוסיף בעתיד
    };

    // 3. שליחת המייל
    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`Error sending email to ${options.email}:`, error);
        // חשוב: לא "נזרוק" שגיאה החוצה כדי שתהליך ההרשמה/הזמנה לא ייכשל אם המייל נכשל
    }
};

export default sendEmail;