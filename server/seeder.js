import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Product from './models/productModel.js'; 
import Category from './models/categoryModel.js'; 
import connectDB from './config/db.js';

dotenv.config();
connectDB();

// --- 1. הגדרת 6 קטגוריות חדשות ---
const CATEGORIES_DATA = [
    { key: 'kitchen', he: 'מטבח גורמה', en: 'Gourmet Kitchen', img: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800' },
    { key: 'bar', he: 'בר ויין', en: 'Bar & Wine', img: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800' },
    { key: 'office', he: 'משרד יוקרתי', en: 'Executive Office', img: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=800' },
    { key: 'bath', he: 'ספא ורחצה', en: 'Spa & Bath', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800' },
    { key: 'outdoor', he: 'גן ומרפסת', en: 'Outdoor Living', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800' },
    { key: 'bedding', he: 'סוויטת שינה', en: 'Bedroom Suite', img: 'https://images.unsplash.com/photo-1505693416388-b0346efee958?q=80&w=800' }
];

// פונקציית עזר ליצירת פריט
const createItem = (skuSuffix, heName, enName, price, img, heDesc, enDesc) => ({
    name: { he: heName, en: enName },
    description: { he: heDesc, en: enDesc },
    details: { 
        he: `פריט זה מקולקציית ${heName} משלב עיצוב מודרני עם חומרים איכותיים ועמידים. נבחר בקפידה כדי לשדרג את חלל הבית ולהעניק תחושת יוקרה.`, 
        en: `This item from the ${enName} collection combines modern design with high-quality durable materials. Carefully selected to upgrade your home space.` 
    },
    price,
    image: img,
    skuSuffix
});

// --- 2. מאגר המוצרים (10 לכל קטגוריה = 60 מוצרים) ---
const PRODUCTS_DATA = {
    'kitchen': [
        createItem('K01', 'סט סכיני שף דמשק', 'Damascus Knife Set', 1200, 'https://images.unsplash.com/photo-1593618998160-e34015e67543?q=80&w=800', 'פלדת דמשק ב-67 שכבות.', '67-layer Damascus steel.'),
        createItem('K02', 'סיר יצוק אמייל', 'Enameled Cast Iron Pot', 450, 'https://images.unsplash.com/photo-1584990347449-a54833f5d456?q=80&w=800', 'פיזור חום מושלם לבישול איטי.', 'Perfect heat distribution for slow cooking.'),
        createItem('K03', 'מכונת אספרסו רטרו', 'Retro Espresso Machine', 2800, 'https://images.unsplash.com/photo-1520981825232-ece5fae45120?q=80&w=800', 'עיצוב איטלקי קלאסי.', 'Classic Italian design.'),
        createItem('K04', 'קרש חיתוך אגוז', 'Walnut Cutting Board', 320, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800', 'עץ אגוז אמריקאי מלא.', 'Solid American walnut wood.'),
        createItem('K05', 'בלנדר מקצועי', 'Professional Blender', 1500, 'https://images.unsplash.com/photo-1570222094114-28a9d8895272?q=80&w=800', 'עוצמה של מטבח תעשייתי.', 'Industrial kitchen power.'),
        createItem('K06', 'סט תבלינים מגנטי', 'Magnetic Spice Set', 180, 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?q=80&w=800', 'ארגון חכם ומעוצב.', 'Smart and stylish organization.'),
        createItem('K07', 'משקל מטבח דיגיטלי', 'Digital Kitchen Scale', 120, 'https://images.unsplash.com/photo-1595348020949-87cdfbb44174?q=80&w=800', 'דיוק של גרם אחד.', 'One gram precision.'),
        createItem('K08', 'מטחנת פלפל חשמלית', 'Electric Pepper Mill', 220, 'https://images.unsplash.com/photo-1585672288636-b6d474cb43bc?q=80&w=800', 'טחינה בלחיצת כפתור.', 'Grinding at the push of a button.'),
        createItem('K09', 'סט כלי ששת נחושת', 'Copper Utensil Set', 350, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800', 'אלגנטיות בכל ערבוב.', 'Elegance in every stir.'),
        createItem('K10', 'טוסטר אובן חכם', 'Smart Toaster Oven', 900, 'https://images.unsplash.com/photo-1585836894080-6060c5c36336?q=80&w=800', 'אפייה מדויקת עם שליטה באפליקציה.', 'Precision baking with app control.')
    ],
    'bar': [
        createItem('B01', 'דקנטר קריסטל', 'Crystal Decanter', 450, 'https://images.unsplash.com/photo-1542845893-f4c0df006764?q=80&w=800', 'לפתיחת הטעמים של היין.', 'Unlocking wine flavors.'),
        createItem('B02', 'סט שייקר קוקטייל', 'Cocktail Shaker Set', 280, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800', 'כל מה שצריך לבר ביתי.', 'Everything needed for a home bar.'),
        createItem('B03', 'מקרר יין קומפקטי', 'Compact Wine Fridge', 1800, 'https://images.unsplash.com/photo-1585553616435-2dc0a54e271d?q=80&w=800', 'שומר על טמפרטורה אידיאלית.', 'Keeps ideal temperature.'),
        createItem('B04', 'כוסות וויסקי חרוטות', 'Etched Whiskey Glasses', 220, 'https://images.unsplash.com/photo-1598155523122-38423bb4d6cf?q=80&w=800', 'כבד ומרשים ביד.', 'Heavy and impressive in hand.'),
        createItem('B05', 'דלי קרח כסוף', 'Silver Ice Bucket', 300, 'https://images.unsplash.com/photo-1572111559815-37604fb6b693?q=80&w=800', 'בידוד כפול לשמירת הקור.', 'Double insulation to keep cold.'),
        createItem('B06', 'פותחן יין חשמלי', 'Electric Wine Opener', 150, 'https://images.unsplash.com/photo-1516535794938-6063878f08cc?q=80&w=800', 'פתיחה חלקה ללא מאמץ.', 'Smooth effortless opening.'),
        createItem('B07', 'תחתיות שיש', 'Marble Coasters', 120, 'https://images.unsplash.com/photo-1616428787720-305141df3c1a?q=80&w=800', 'הגנה בסטייל על השולחן.', 'Stylish protection for the table.'),
        createItem('B08', 'עגלת משקאות', 'Bar Cart', 950, 'https://images.unsplash.com/photo-1505693416388-b0346efee958?q=80&w=800', 'ניידות ואירוח בסלון.', 'Mobility and hosting in the living room.'),
        createItem('B09', 'אבני קירור לוויסקי', 'Whiskey Stones', 90, 'https://images.unsplash.com/photo-1608757877296-60c7df255c4d?q=80&w=800', 'קירור ללא דילול המשקה.', 'Cooling without diluting.'),
        createItem('B10', 'מעמד בקבוקים', 'Wine Rack', 380, 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=800', 'תצוגה מרשימה לאוסף שלך.', 'Impressive display for your collection.')
    ],
    'office': [
        createItem('O01', 'מנורת שולחן פליז', 'Brass Desk Lamp', 420, 'https://images.unsplash.com/photo-1513506003013-19c6cd580199?q=80&w=800', 'תאורה ממוקדת ועיצוב רטרו.', 'Focused lighting and retro design.'),
        createItem('O02', 'משטח שולחן מעור', 'Leather Desk Pad', 250, 'https://images.unsplash.com/photo-1520699697851-3dc68aa3a474?q=80&w=800', 'משטח עבודה יוקרתי ונעים.', 'Luxury and comfortable workspace.'),
        createItem('O03', 'ארגונית עץ אלון', 'Oak Desk Organizer', 180, 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=800', 'סדר בעיניים סדר בראש.', 'Order in sight, order in mind.'),
        createItem('O04', 'כיסא מנהלים ארגונומי', 'Ergonomic Chair', 1800, 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800', 'תמיכה מלאה לגב.', 'Full back support.'),
        createItem('O05', 'עט נובע יוקרתי', 'Luxury Fountain Pen', 350, 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=800', 'חווית כתיבה אחרת.', 'A different writing experience.'),
        createItem('O06', 'שעון חול מעוצב', 'Designer Hourglass', 120, 'https://images.unsplash.com/photo-1563205764-6e01297e283b?q=80&w=800', 'ניהול זמן בסטייל.', 'Time management in style.'),
        createItem('O07', 'מחברת כריכת עור', 'Leather Notebook', 90, 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800', 'למחשבות הגדולות שלך.', 'For your big thoughts.'),
        createItem('O08', 'מעמד לפטופ אלומיניום', 'Aluminum Laptop Stand', 200, 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800', 'זווית צפייה מושלמת.', 'Perfect viewing angle.'),
        createItem('O09', 'צמח סוקולנט מלאכותי', 'Faux Succulent', 60, 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=800', 'ירוק ללא טיפול.', 'Green without care.'),
        createItem('O10', 'גלובוס שולחני', 'Desktop Globe', 280, 'https://images.unsplash.com/photo-1521295121783-8a321d551ad2?q=80&w=800', 'העולם בכף ידך.', 'The world in your palm.')
    ],
    'bath': [
        createItem('S01', 'דיפיוזר קרמי', 'Ceramic Diffuser', 220, 'https://images.unsplash.com/photo-1608503816912-f703e7215286?q=80&w=800', 'פיזור ריח שקט ומרגיע.', 'Quiet and relaxing scent diffusion.'),
        createItem('S02', 'מגש אמבטיה במבוק', 'Bamboo Bathtub Tray', 180, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800', 'לקרוא ספר באמבטיה.', 'Read a book in the bath.'),
        createItem('S03', 'סט סבונים טבעיים', 'Natural Soap Set', 120, 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?q=80&w=800', 'רכיבים אורגניים בלבד.', 'Organic ingredients only.'),
        createItem('S04', 'חלוק רחצה מצרי', 'Egyptian Cotton Robe', 350, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=800', 'כמו במלון 5 כוכבים.', 'Like a 5-star hotel.'),
        createItem('S05', 'מחמם מגבות', 'Towel Warmer', 600, 'https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?q=80&w=800', 'לצאת למגבת חמה.', 'Step out to a warm towel.'),
        createItem('S06', 'מראת איפור מוארת', 'Lighted Makeup Mirror', 280, 'https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?q=80&w=800', 'תאורה מחמיאה ומדויקת.', 'Flattering and precise lighting.'),
        createItem('S07', 'נר ריחני גדול', 'Large Scented Candle', 150, 'https://images.unsplash.com/photo-1602523961358-f9f03dd557db?q=80&w=800', '60 שעות בעירה.', '60 hours of burn time.'),
        createItem('S08', 'סל כביסה קלוע', 'Woven Laundry Basket', 200, 'https://images.unsplash.com/photo-1582735689369-c613c66070a8?q=80&w=800', 'מסתיר את הבלאגן ביופי.', 'Hides mess beautifully.'),
        createItem('S09', 'שטיחון אמבטיה סופג', 'Absorbent Bath Mat', 90, 'https://images.unsplash.com/photo-1576426863848-c21f5fc67255?q=80&w=800', 'רך ונעים לכפות הרגליים.', 'Soft and pleasant for feet.'),
        createItem('S10', 'ראש מקלחת גשם', 'Rain Shower Head', 450, 'https://images.unsplash.com/photo-1517616233156-6a4a1599540c?q=80&w=800', 'חווית מקלחת מפנקת.', 'Pampering shower experience.')
    ],
    'outdoor': [
        createItem('G01', 'בור אש לגינה', 'Garden Fire Pit', 850, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800', 'חמימות בלילות קרירים.', 'Warmth on cool nights.'),
        createItem('G02', 'ערסל מקרמה', 'Macrame Hammock', 320, 'https://images.unsplash.com/photo-1541004995602-b3e898709909?q=80&w=800', 'בוהו שיק למרפסת.', 'Boho chic for the balcony.'),
        createItem('G03', 'תאורת גן סולארית', 'Solar Garden Lights', 180, 'https://images.unsplash.com/photo-1510137600163-2729bc699b0b?q=80&w=800', 'חסכוני וירוק.', 'Economical and green.'),
        createItem('G04', 'כלי גינון נחושת', 'Copper Gardening Tools', 250, 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=800', 'עמידים ויפים.', 'Durable and beautiful.'),
        createItem('G05', 'עציץ בטון גדול', 'Large Concrete Planter', 400, 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800', 'לצמחים גדולים ומרשימים.', 'For large impressive plants.'),
        createItem('G06', 'כיסא נוח מעץ', 'Wooden Lounge Chair', 550, 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800', 'נוחות מקסימלית בשמש.', 'Maximum comfort in the sun.'),
        createItem('G07', 'מזרקת מים קטנה', 'Small Water Fountain', 380, 'https://images.unsplash.com/photo-1515263167123-e1867db3269b?q=80&w=800', 'צליל פכפוך מרגיע.', 'Relaxing trickling sound.'),
        createItem('G08', 'גריל פחמים נייד', 'Portable Charcoal Grill', 450, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800', 'לפיקניק מושלם.', 'For a perfect picnic.'),
        createItem('G09', 'שמיכת פיקניק עמידה', 'Durable Picnic Blanket', 120, 'https://images.unsplash.com/photo-1596241913256-254243ff5605?q=80&w=800', 'דוחה מים וכתמים.', 'Water and stain repellent.'),
        createItem('G10', 'בית נר לנרות', 'Lantern Candle Holder', 150, 'https://images.unsplash.com/photo-1542835843-988941f17e79?q=80&w=800', 'אווירה קסומה.', 'Magical atmosphere.')
    ],
    'bedding': [
        createItem('L01', 'סט מצעי משי', 'Silk Bedding Set', 1500, 'https://images.unsplash.com/photo-1505693416388-b0346efee958?q=80&w=800', 'חלק וקריר למגע.', 'Smooth and cool to touch.'),
        createItem('L02', 'שמיכת פוך אווזים', 'Goose Down Duvet', 1200, 'https://images.unsplash.com/photo-1522771772428-a1998dd99a77?q=80&w=800', 'קל כנוצה ומחמם.', 'Light as a feather and warm.'),
        createItem('L03', 'כרית שינה אורטופדית', 'Orthopedic Pillow', 350, 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=800', 'תמיכה לצוואר.', 'Neck support.'),
        createItem('L04', 'שמיכת כובד מרגיעה', 'Weighted Blanket', 450, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=800', 'לשינה עמוקה ורגועה.', 'For deep restful sleep.'),
        createItem('L05', 'כיסוי עיניים משי', 'Silk Sleep Mask', 90, 'https://images.unsplash.com/photo-1518542331925-4e91e9aa0074?q=80&w=800', 'חושך מוחלט בכל מקום.', 'Total darkness anywhere.'),
        createItem('L06', 'קראף מים לשידה', 'Bedside Water Carafe', 120, 'https://images.unsplash.com/photo-1542845893-f4c0df006764?q=80&w=800', 'מים צלולים ליד המיטה.', 'Clear water by the bed.'),
        createItem('L07', 'שטיח צמר לחדר', 'Wool Bedroom Rug', 800, 'https://images.unsplash.com/photo-1571701385458-9419b48622f9?q=80&w=800', 'צעד ראשון רך בבוקר.', 'Soft first step in the morning.'),
        createItem('L08', 'וילונות האפלה', 'Blackout Curtains', 550, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800', 'פרטיות מלאה.', 'Full privacy.'),
        createItem('L09', 'מגש ארוחת בוקר', 'Breakfast Tray', 180, 'https://images.unsplash.com/photo-1511252062534-8c8f00030588?q=80&w=800', 'פינוק במיטה.', 'Pampering in bed.'),
        createItem('L10', 'תרסיס לבנדר לכרית', 'Lavender Pillow Mist', 60, 'https://images.unsplash.com/photo-1608503816912-f703e7215286?q=80&w=800', 'ניחוח מרגיע לפני השינה.', 'Calming scent before sleep.')
    ]
};

const importData = async () => {
  try {
    await Product.deleteMany();
    await Category.deleteMany();
    console.log('נמחקו נתונים ישנים...'.red.inverse);

    // יצירת הקטגוריות
    const categoryMap = {};
    for (const cat of CATEGORIES_DATA) {
        const createdCat = await Category.create({
            name: { he: cat.he, en: cat.en },
            key: cat.key,
            image: cat.img,
            isActive: true,
            showOnHomepage: true
        });
        categoryMap[cat.key] = createdCat._id;
        console.log(`קטגוריה נוצרה: ${cat.he}`.green);
    }

    // יצירת המוצרים
    const productsToInsert = [];
    for (const [key, items] of Object.entries(PRODUCTS_DATA)) {
        if (categoryMap[key]) {
            items.forEach(item => {
                productsToInsert.push({
                    ...item,
                    category: categoryMap[key],
                    sku: `${key.toUpperCase()}-${item.skuSuffix}`,
                    isPopular: Math.random() > 0.8,
                    isActive: true, // חובה!
                    inStock: true
                });
            });
        }
    }

    await Product.insertMany(productsToInsert);
    console.log(`בהצלחה! יובאו ${productsToInsert.length} מוצרים חדשים`.green.inverse);
    process.exit();

  } catch (error) {
    console.error(`שגיאה: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

importData();