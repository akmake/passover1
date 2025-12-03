# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.



מסמך תיעוד: פרויקט "קייטרינג פסח"
גרסה: 1.0
תאריך: 1 באוקטובר 2025

חלק 1: מבוא ותקציר הפרויקט
1.1. מטרת הפרויקט
פרויקט "קייטרינג פסח" הוא מערכת Full-Stack מודרנית להזמנת אוכל מוכן לחג הפסח. האתר מאפשר ללקוחות פרטיים ועסקיים לצפות בתפריט עשיר, להרכיב הזמנה אישית או לבחור חבילות חג מובנות, ולבצע הזמנה בצורה מאובטחת. במקביל, המערכת מספקת פאנל ניהול מתקדם למנהלי האתר, המאפשר שליטה מלאה על התפריט, ההזמנות, המשתמשים והלוגיסטיקה.

1.2. קהל יעד
לקוחות קצה: משפחות ואנשים פרטיים המעוניינים להזמין אוכל מוכן לחג הפסח.

מנהלי האתר (Admins): צוות הקייטרינג האחראי על תפעול המערכת, ניהול התוכן וטיפול בהזמנות.

1.3. ארכיטקטורה כללית
הפרויקט בנוי בארכיטקטורת Monorepo, המכילה שני תתי-פרויקטים נפרדים בתוך מאגר קוד (Repository) אחד:

client/ (צד לקוח): אפליקציית Single-Page Application (SPA) מבוססת React, אחראית על כל ממשק המשתמש וחווית הלקוח.

server/ (צד שרת): שרת API מבוסס Node.js ו-Express, המנהל את הלוגיקה העסקית, התקשורת עם מסד הנתונים, אימות משתמשים ואבטחה.

1.4. ערימה טכנולוגית (Tech Stack)
צד לקוח: React, Vite, React Router, Zustand, TanStack Query, Tailwind CSS, Headless UI.

צד שרת: Node.js, Express.js, MongoDB (עם Mongoose).

אימות ואבטחה: JWT (Access + Refresh Tokens), bcrypt, Helmet, CORS, CSRF, Rate-Limiting.

סביבת פיתוח והרצה: Docker, Concurrent.ly, Nodemon.

חלק 2: תיעוד טכני מפורט
2.1. צד השרת (Backend)
2.1.1. מבנה התיקיות
/models: מכיל את הסכמות של Mongoose המגדירות את מבנה המסמכים במסד הנתונים (Users, Products, Orders, וכו').

/routes: מגדיר את כל נקודות הקצה (Endpoints) של ה-API. כל קובץ אחראי על תחום אחר (למשל, auth.js, products.js).

/controllers: מכיל את הלוגיקה העסקית. כל פונקציה בקונטרולר מקבלת בקשה מה-Route, מבצעת את הפעולה הנדרשת מול המודל, ומחזירה תגובה.

/middlewares: פונקציות ביניים שרצות לפני הקונטרולרים, לדוגמה, בדיקת הרשאות (requireAdmin), הגבלת קצב בקשות (rateLimiter).

/utils: כלי עזר לשימוש חוזר, כמו טיפול בטוקנים (tokenHandler).

2.1.2. מודלים של מסד הנתונים (Mongoose Models)
userModel.js (משתמש):

name: שם המשתמש.

email: כתובת אימייל (ייחודית).

passwordHash: סיסמה מוצפנת באמצעות bcrypt.

role: תפקיד המשתמש (user או admin).

cart: מערך של מוצרים שהמשתמש הוסיף לעגלה, נשמר בשרת.

אבטחה: כולל שדות לנעילת חשבון: failedLoginAttempts, lockUntil.

productModel.js (מוצר):

name, description, price, image.

category: סיווג (מנה עיקרית, תוספת, וכו').

kashrut: כשרות (פרווה, חלבי, בשרי).

sku: מק"ט ייחודי לניהול מלאי.

unit: יחידת מידה (ק"ג, יחידה, מארז).

orderModel.js (הזמנה):

customer: קישור למזהה המשתמש שביצע את ההזמנה.

items: מערך של המוצרים והכמויות שהוזמנו.

total: סכום ההזמנה הכולל.

status: סטטוס ההזמנה (חדשה, בטיפול, נשלחה, וכו').

centerModel.js (מרכז חלוקה):

name: שם המרכז (לדוגמה: "תל אביב - דיזנגוף סנטר").

address, active, capacity (כמות הזמנות מקסימלית).

2.1.3. מנגנוני אבטחה (ברמת אבטחה של בנק)
זוהי הדרישה המרכזית בפרויקט. להלן המנגנונים המיושמים:

אימות מבוסס JWT ו-Refresh Tokens:

Access Token: טוקן גישה קצר-מועד (15 דקות) המאמת את המשתמש בכל בקשה.

Refresh Token: טוקן רענון ארוך-מועד (7 ימים) המאפשר לחדש את טוקן הגישה באופן אוטומטי ומאובטח.

אחסון מאובטח: שני הטוקנים נשמרים בעוגיות HttpOnly, Secure ו-SameSite=Strict, מה שהופך אותם לבלתי נגישים לקוד JavaScript בצד הלקוח ומונע התקפות XSS ו-CSRF בסיסיות.

הצפנת סיסמאות (Hashing): שימוש בספריית bcrypt עם salt של 12 סיבובים להצפנה חזקה של סיסמאות.

הגנת CSRF (Cross-Site Request Forgery): שימוש בספריית csurf. הלקוח חייב לשלוח טוקן CSRF ייחודי בכל בקשה מסוג POST, PUT, DELETE כדי להבטיח שהבקשה מגיעה מהאתר המקורי ולא מאתר זדוני.

הגנה מ-NoSQL Injection: שימוש ב-express-mongo-sanitize כדי לנקות את כל הקלט מהמשתמשים ולהסיר תווים שעלולים לנצל חולשות במסד הנתונים.

הגדרות אבטחת HTTP Headers: שימוש בספריית helmet להוספת שכבות הגנה מרובות, כולל הגדרות Content-Security-Policy (CSP), X-Content-Type-Options, ועוד.

הגבלת קצב בקשות (Rate Limiting): שימוש ב-express-rate-limit כדי להגביל את מספר הבקשות מכתובת IP בודדת, ובכך למנוע התקפות כוח גס (Brute-force) על מסכי התחברות והרשמה.

בקרת הרשאות: שימוש ב-Middlewares ייעודיים (requireAuth, requireAdmin) כדי להבטיח שרק משתמשים עם ההרשאה המתאימה יכולים לגשת לנקודות קצה רגישות.

מנגנון נעילת חשבון: המודל userModel כולל לוגיקה למעקב אחר ניסיונות התחברות כושלים וננעל אוטומטית למשך 10 דקות לאחר 5 ניסיונות כושלים.

2.2. צד הלקוח (Frontend)
2.2.1. ניהול מצב (State Management)
Zustand: משמש לניהול מצב גלובלי פשוט וריאקטיבי.

authStore: מחזיק את פרטי המשתמש המחובר ומצב האימות. מסונכרן עם localStorage כדי לשמור על החיבור בין רענוני דף.

cartStore: מנהל את עגלת הקניות. מאזין ל-authStore כדי לטעון או לנקות את העגלה באופן אוטומטי בעת התחברות/התנתקות. כולל debounce למניעת שליחת בקשות רבות מדי לשרת בעת עדכון העגלה.

2.2.2. שליפת נתונים (Data Fetching)
@tanstack/react-query: הכלי המרכזי לניהול תקשורת עם השרת. כל קריאות ה-API נעטפות ב-Hooks של React Query (כמו useQuery, useMutation) כדי לקבל יכולות מתקדמות של ניהול קאש, עדכון אוטומטי ברקע, טיפול במצבי טעינה ושגיאה, ועוד.

axios ו-Interceptors: מוגדר קובץ api.js עם מופע מרכזי של axios. מופע זה כולל Interceptor שמטפל אוטומטית בשגיאות 401 (Unauthorized). כאשר טוקן הגישה פג תוקף, ה-Interceptor מנסה לרענן אותו באמצעות ה-Refresh Token, ואם מצליח, הוא שולח מחדש את הבקשה המקורית באופן שקוף למשתמש.

2.2.3. ניווט (Routing)
React Router DOM: משמש לניהול הניווט באתר.

נתיבים מוגנים (Protected Routes): קיימים רכיבים ייעודיים (UserRoute, AdminRoute) שבודקים את מצב האימות וההרשאות של המשתמש לפני שהם מאפשרים גישה לדפים מסוימים (כמו Dashboard או Admin).

2.3. משימות עתידיות ושיפורים (מה צריך להוסיף)
זוהי רשימת המשימות המרכזיות לפיתוח עתידי, המיועדת למפתח חדש שנכנס לפרויקט:

מימוש "סעודת חג" (Meal Package):

Backend: יש ליצור מודל Mongoose חדש mealPackageModel.js. המודל יכיל שדות בסיסיים (שם, מחיר) ושני שדות מורכבים: fixedItems (מערך של מוצרים קבועים) ו-choiceRules (מערך של חוקי בחירה, כפי שנדון). יש לבנות routes ו-controllers חדשים לניהול CRUD מלא של חבילות אלו בממשק הניהול.

Frontend: יש ליצור עמוד חדש PackageBuilderPage.jsx שיציג את החבילה ויאפשר ללקוח לבצע את הבחירות שלו. יש לעדכן את עגלת הקניות כך שתדע להציג חבילה מורכבת.

שיפורי UI/UX:

סינון ומיון מתקדם בעמוד התפריט: יש להוסיף סרגל צד עם אפשרויות סינון לפי category ו-kashrut ומיון לפי מחיר ופופולריות.

מימוש "רכישה כאורח" (Guest Checkout): יש לעדכן את תהליך התשלום כדי לאפשר למשתמשים להזמין מבלי להירשם.

הוספת מערכת דירוג וביקורות: יש להוסיף למודל Product שדה עבור ביקורות, וליצור רכיבים להצגה והוספה של ביקורות בעמוד המוצר.

תכונות חדשות (New Features):

הרשמה חברתית (Social Login): יש להוסיף ספריות כמו Passport.js בצד השרת כדי לאפשר התחברות עם גוגל/פייסבוק.

מערכת קופונים: יש ליצור מודל Coupon בשרת וממשק ניהול עבורו, ולשלב את הלוגיקה שלו בתהליך התשלום.

שליחת מיילים אוטומטית: יש לשלב שירות שליחת מיילים (כמו SendGrid) כדי לשלוח אישורי הזמנה ועדכוני סטטוס.

שיפורים טכניים:

הוספת בדיקות (Testing): הפרויקט הנוכחי חסר בדיקות. יש להוסיף תשתית בדיקות, למשל Jest ו-React Testing Library לצד הלקוח, ו-Jest ו-Supertest לצד השרת.

2.4. הרצת הפרויקט
הרצה מקומית (פיתוח):

יש לוודא קיום קובץ .env בתיקיית server עם המשתנים הנדרשים (כמו MONGO_URI).

בתיקייה הראשית, הרץ npm run install-all להתקנת התלויות.

הרץ npm run dev להפעלת הלקוח והשרת במקביל.

הרצה עם Docker:

יש לוודא ש-Docker ו-Docker Compose מותקנים.

בתיקייה הראשית, הרץ npm run docker:up.