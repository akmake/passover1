import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Product from './models/productModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const CATEGORIES = {
  FURNITURE: 'furniture',
  LIGHTING: 'lighting',
  TEXTILES: 'textiles',
  DECOR: 'decor',
  ART: 'art',
  KITCHEN: 'kitchen'
};

// מאגר של 100 תמונות ייחודיות מותאמות לקטגוריות
const UNIQUE_PRODUCTS = [
  // --- FURNITURE (20 Items) ---
  { name: { he: 'כורסאת קטיפה ירוקה', en: 'Emerald Velvet Armchair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800', price: 4500 },
  { name: { he: 'כיסא עץ מינימליסטי', en: 'Minimalist Oak Chair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800', price: 1200 },
  { name: { he: 'ספת עור קוניאק', en: 'Cognac Leather Sofa' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=800', price: 12000 },
  { name: { he: 'שידת צד מודרנית', en: 'Modern Nightstand' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=800', price: 1800 },
  { name: { he: 'שולחן קפה שיש', en: 'Marble Coffee Table' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?q=80&w=800', price: 3500 },
  { name: { he: 'כיסא אוכל ראטן', en: 'Rattan Dining Chair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=800', price: 950 },
  { name: { he: 'הדום קטיפה כחול', en: 'Navy Velvet Ottoman' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800', price: 890 },
  { name: { he: 'מזנון עץ אגוז', en: 'Walnut Sideboard' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=800', price: 5600 },
  { name: { he: 'כורסאת רביצה', en: 'Lounge Chair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=800', price: 2800 },
  { name: { he: 'שרפרף עץ גושני', en: 'Raw Wood Stool' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1503602642458-2321114458ed?q=80&w=800', price: 650 },
  { name: { he: 'ספה פינתית אפורה', en: 'Grey Sectional Sofa' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?q=80&w=800', price: 9800 },
  { name: { he: 'שולחן כתיבה מעוצב', en: 'Designer Desk' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?q=80&w=800', price: 4200 },
  { name: { he: 'שידת מגירות לבנה', en: 'White Chest Drawers' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1595515106967-1434857ed836?q=80&w=800', price: 2100 },
  { name: { he: 'כיסא בר גבוה', en: 'High Bar Stool' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=800', price: 850 },
  { name: { he: 'מדפי ספרים מתכת', en: 'Metal Bookshelf' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?q=80&w=800', price: 3200 },
  { name: { he: 'שולחן צד עגול', en: 'Round Side Table' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1611967164521-abae8fba4668?q=80&w=800', price: 1100 },
  { name: { he: 'כורסאת עור שחורה', en: 'Black Leather Chair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=800', price: 3900 },
  { name: { he: 'מיטה זוגית מרופדת', en: 'Upholstered Bed' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1505693416388-b0346ef3bf2b?q=80&w=800', price: 7500 },
  { name: { he: 'קונסולה לכניסה', en: 'Entryway Console' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1515362778563-6a8d0e44bc0b?q=80&w=800', price: 2300 },
  { name: { he: 'כיסא נדנדה מודרני', en: 'Modern Rocking Chair' }, cat: CATEGORIES.FURNITURE, img: 'https://images.unsplash.com/photo-1506898667547-42e22a46e125?q=80&w=800', price: 1900 },

  // --- LIGHTING (15 Items) ---
  { name: { he: 'מנורת רצפה קשת', en: 'Arc Floor Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1507473888900-52e1ad145986?q=80&w=800', price: 1500 },
  { name: { he: 'נורת אדיסון תלויה', en: 'Hanging Edison Bulb' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1540932296757-f5f95df48196?q=80&w=800', price: 350 },
  { name: { he: 'מנורת שולחן בטון', en: 'Concrete Desk Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1513506003011-38f04415426a?q=80&w=800', price: 450 },
  { name: { he: 'נברשת מודרנית', en: 'Modern Chandelier' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?q=80&w=800', price: 2800 },
  { name: { he: 'מנורת קיר פליז', en: 'Brass Wall Sconce' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=800', price: 890 },
  { name: { he: 'מנורת לילה כדורית', en: 'Globe Bedside Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1534234828569-1f3571d4b441?q=80&w=800', price: 550 },
  { name: { he: 'אהיל ראטן טבעי', en: 'Rattan Shade' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?q=80&w=800', price: 620 },
  { name: { he: 'מנורת תקרה גיאומטרית', en: 'Geometric Ceiling Light' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=800', price: 1200 },
  { name: { he: 'מנורת עמידה שחורה', en: 'Black Standing Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1511467007265-431872196d4b?q=80&w=800', price: 1100 },
  { name: { he: 'מנורת קריאה', en: 'Reading Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=800', price: 480 },
  { name: { he: 'נברשת זכוכית', en: 'Glass Chandelier' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1543198126-18d092305330?q=80&w=800', price: 3400 },
  { name: { he: 'מנורת שולחן קרמיקה', en: 'Ceramic Table Lamp' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1616164282363-2337d122240b?q=80&w=800', price: 790 },
  { name: { he: 'תאורת אווירה', en: 'Ambient Light' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1567861911437-538298e4232c?q=80&w=800', price: 320 },
  { name: { he: 'מנורת תלייה תעשייתית', en: 'Industrial Pendant' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1552554605-2415d8d64168?q=80&w=800', price: 950 },
  { name: { he: 'ספוט לייט מעוצב', en: 'Designer Spotlight' }, cat: CATEGORIES.LIGHTING, img: 'https://images.unsplash.com/photo-1550534245-c4d62325c7be?q=80&w=800', price: 600 },

  // --- TEXTILES (15 Items) ---
  { name: { he: 'כרית נוי חרדל', en: 'Mustard Throw Pillow' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?q=80&w=800', price: 250 },
  { name: { he: 'שמיכת צמר סרוגה', en: 'Knitted Wool Blanket' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1579656381226-5fc7036d6c35?q=80&w=800', price: 650 },
  { name: { he: 'שטיח בוהו שיק', en: 'Boho Chic Rug' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?q=80&w=800', price: 1800 },
  { name: { he: 'וילונות פשתן לבנים', en: 'White Linen Curtains' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=800', price: 900 },
  { name: { he: 'כרית קטיפה ורודה', en: 'Pink Velvet Pillow' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1531835551805-16d864c8d311?q=80&w=800', price: 220 },
  { name: { he: 'מצעים מכותנה מצרית', en: 'Egyptian Cotton Sheets' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1522771753035-1a5b6562f329?q=80&w=800', price: 850 },
  { name: { he: 'שטיח כניסה יוטה', en: 'Jute Doormat' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1522758971460-1d21eed7dc1d?q=80&w=800', price: 180 },
  { name: { he: 'כריות נוי מעור', en: 'Leather Accent Pillows' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=800', price: 380 },
  { name: { he: 'שמיכת פליז רכה', en: 'Soft Fleece Throw' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1512918760513-95f192972563?q=80&w=800', price: 320 },
  { name: { he: 'מגבות אמבט יוקרה', en: 'Luxury Bath Towels' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?q=80&w=800', price: 450 },
  { name: { he: 'ראנר לשולחן', en: 'Table Runner' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1574635836916-2911b3b27b87?q=80&w=800', price: 280 },
  { name: { he: 'שטיח צמר גיאומטרי', en: 'Geometric Wool Rug' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1534882294437-074691458319?q=80&w=800', price: 2100 },
  { name: { he: 'כרית משי', en: 'Silk Pillowcase' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1578840602674-bd891cb7ea5b?q=80&w=800', price: 290 },
  { name: { he: 'פלייסמטים קלועים', en: 'Woven Placemats' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=800', price: 150 },
  { name: { he: 'שמיכת טלאים', en: 'Quilt Blanket' }, cat: CATEGORIES.TEXTILES, img: 'https://images.unsplash.com/photo-1578983427937-26078ee3d9d3?q=80&w=800', price: 580 },

  // --- DECOR (20 Items) ---
  { name: { he: 'אגרטל קרמיקה לבן', en: 'White Ceramic Vase' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1581783342308-f792ca11dfdd?q=80&w=800', price: 280 },
  { name: { he: 'פסל אבסטרקטי', en: 'Abstract Sculpture' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800', price: 850 },
  { name: { he: 'מגש שיש ירוק', en: 'Green Marble Tray' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?q=80&w=800', price: 420 },
  { name: { he: 'אבני נוי דקורטיביות', en: 'Decorative Stones' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1533158388470-9a56699990c6?q=80&w=800', price: 120 },
  { name: { he: 'שעון חול מעוצב', en: 'Designer Hourglass' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1550948537-130a1ce83314?q=80&w=800', price: 180 },
  { name: { he: 'פמוטי זהב', en: 'Gold Candlesticks' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1603517886478-f71663b46944?q=80&w=800', price: 320 },
  { name: { he: 'קערת עץ טיק', en: 'Teak Wood Bowl' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=800', price: 350 },
  { name: { he: 'מראה עם מסגרת פליז', en: 'Brass Framed Mirror' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=800', price: 1400 },
  { name: { he: 'מעמד ספרים שיש', en: 'Marble Bookends' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800', price: 290 },
  { name: { he: 'אגרטל זכוכית מעושנת', en: 'Smoked Glass Vase' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1580483253372-e1d09017688c?q=80&w=800', price: 250 },
  { name: { he: 'סלסלת קש קלועה', en: 'Woven Wicker Basket' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1591123720664-59654a434157?q=80&w=800', price: 190 },
  { name: { he: 'פסל ראש יווני', en: 'Greek Bust Sculpture' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1576158673758-a567677d242a?q=80&w=800', price: 680 },
  { name: { he: 'עציץ בטון', en: 'Concrete Planter' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800', price: 150 },
  { name: { he: 'מתלה מעילים מעוצב', en: 'Modern Coat Rack' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1517174637372-46a2a0d922a8?q=80&w=800', price: 480 },
  { name: { he: 'קופסת אחסון דקורטיבית', en: 'Decorative Storage Box' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1565111000-845f22e38953?q=80&w=800', price: 220 },
  { name: { he: 'מעמד עציצים זהב', en: 'Gold Plant Stand' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1600424566373-c60f4e38a4c1?q=80&w=800', price: 360 },
  { name: { he: 'קישוט קיר מקרמה', en: 'Macrame Wall Hanging' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1519098901909-b1553a1190af?q=80&w=800', price: 280 },
  { name: { he: 'שעון קיר מינימליסטי', en: 'Minimalist Wall Clock' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1563861826100-9cb868c06c7e?q=80&w=800', price: 420 },
  { name: { he: 'כד חרס עתיק', en: 'Antique Clay Jug' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?q=80&w=800', price: 850 },
  { name: { he: 'מגש מראה', en: 'Mirrored Tray' }, cat: CATEGORIES.DECOR, img: 'https://images.unsplash.com/photo-1584680269384-5f7267f53df5?q=80&w=800', price: 340 },

  // --- KITCHEN (15 Items) ---
  { name: { he: 'סט צלחות קרמיקה', en: 'Ceramic Dinner Set' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1577905753086-647d6d370146?q=80&w=800', price: 950 },
  { name: { he: 'כוסות יין קריסטל', en: 'Crystal Wine Glasses' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?q=80&w=800', price: 480 },
  { name: { he: 'סכו"ם זהב מט', en: 'Matte Gold Cutlery' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1616231631557-2384a3299388?q=80&w=800', price: 650 },
  { name: { he: 'קערת פירות', en: 'Fruit Bowl' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1610629738435-0816823c0487?q=80&w=800', price: 220 },
  { name: { he: 'בוצ\'ר בלוק', en: 'Butcher Block' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?q=80&w=800', price: 550 },
  { name: { he: 'צנצנות זכוכית לתבלינים', en: 'Glass Spice Jars' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1595248557262-d9f2c69e5d48?q=80&w=800', price: 180 },
  { name: { he: 'קנקן מים מעוצב', en: 'Designer Water Pitcher' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1574969884448-fe50ceeb2b81?q=80&w=800', price: 320 },
  { name: { he: 'כלי הגשה מעץ', en: 'Wooden Serving Ware' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1602404987770-56279930f429?q=80&w=800', price: 450 },
  { name: { he: 'ספלי אספרסו', en: 'Espresso Cups' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=800', price: 180 },
  { name: { he: 'תבנית אפייה קרמית', en: 'Ceramic Baking Dish' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1585250003058-2f47a5b51a4a?q=80&w=800', price: 280 },
  { name: { he: 'קומקום תה יפני', en: 'Japanese Tea Pot' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?q=80&w=800', price: 420 },
  { name: { he: 'מגבות מטבח פשתן', en: 'Linen Kitchen Towels' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800', price: 120 },
  { name: { he: 'מעמד לעוגה', en: 'Cake Stand' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1600863071295-a22c544d93e8?q=80&w=800', price: 350 },
  { name: { he: 'כותש שום שיש', en: 'Marble Mortar' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1603569283847-aa295f0d016a?q=80&w=800', price: 260 },
  { name: { he: 'כוסות וויסקי', en: 'Whiskey Tumblers' }, cat: CATEGORIES.KITCHEN, img: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=800', price: 380 },

  // --- ART (8 Items) ---
  { name: { he: 'הדפס אבסטרקטי שחור', en: 'Black Abstract Print' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1580136906451-b94b05e5715e?q=80&w=800', price: 550 },
  { name: { he: 'ציור שמן נוף', en: 'Landscape Oil Painting' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800', price: 2500 },
  { name: { he: 'מסגרת עץ אלון', en: 'Oak Wood Frame' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1515405295579-ba7b45403062?q=80&w=800', price: 180 },
  { name: { he: 'פוסטר בוטני', en: 'Botanical Poster' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1507643179173-442f8552932c?q=80&w=800', price: 220 },
  { name: { he: 'צילום אדריכלי', en: 'Architecture Photography' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=800', price: 850 },
  { name: { he: 'קנבס מינימליסטי', en: 'Minimalist Canvas' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800', price: 1200 },
  { name: { he: 'פסל קיר מתכת', en: 'Metal Wall Art' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?q=80&w=800', price: 1500 },
  { name: { he: 'גלריה שחור לבן', en: 'BW Gallery Set' }, cat: CATEGORIES.ART, img: 'https://images.unsplash.com/photo-1531913764164-f859dc02d1e5?q=80&w=800', price: 2800 },

  // --- SCENTS (7 Items) ---
  { name: { he: 'נר בריח יסמין', en: 'Jasmine Scented Candle' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1602143407151-01114195932e?q=80&w=800', price: 150 },
  { name: { he: 'מפיץ ריח יוקרתי', en: 'Luxury Diffuser' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=800', price: 280 },
  { name: { he: 'שמנים אתריים', en: 'Essential Oils Set' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1596436065584-3b610d486253?q=80&w=800', price: 320 },
  { name: { he: 'נר בתוך בטון', en: 'Concrete Candle' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=800', price: 180 },
  { name: { he: 'מבער שמנים', en: 'Oil Burner' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1608503816912-f703e7215286?q=80&w=800', price: 140 },
  { name: { he: 'תרסיס ריח לבית', en: 'Room Spray' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1616053335552-320d3f82527c?q=80&w=800', price: 160 },
  { name: { he: 'נרות ארוכים לשולחן', en: 'Taper Candles' }, cat: CATEGORIES.SCENTS, img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800', price: 90 }
];

const importData = async () => {
  try {
    await Product.deleteMany();
    console.log('Cleared old products...'.red.inverse);

    const products = UNIQUE_PRODUCTS.map(item => ({
      name: item.name,
      description: { 
        he: `פריט ${item.name.he} מקולקציית ${new Date().getFullYear()}. עיצוב על-זמני המשלב חומרים איכותיים וגימור מוקפד.`, 
        en: `The ${item.name.en} from our ${new Date().getFullYear()} collection. Timeless design combining quality materials and meticulous finish.` 
      },
      price: item.price,
      category: item.cat,
      image: item.img,
      isPopular: Math.random() > 0.8,
      stock: Math.floor(Math.random() * 50) + 5
    }));

    await Product.insertMany(products);
    
    console.log(`Successfully imported ${products.length} unique luxury items!`.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

importData();