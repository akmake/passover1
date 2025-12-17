import mongoose from 'mongoose';
import dotenv from 'dotenv';
import colors from 'colors';
import Product from './models/productModel.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const CATEGORIES = {
  WATCHES: 'watches',
  JEWELRY: 'jewelry',
  PERFUMES: 'perfumes',
  LEATHER: 'leather_goods',
  GIFT_SETS: 'gift_sets',
  EXCLUSIVE: 'exclusive'
};

// מאגר תמונות איכותיות לכל קטגוריה (כדי לגוון)
const IMAGES = {
  [CATEGORIES.WATCHES]: [
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1619134778706-c279330aac23?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=1000&auto=format&fit=crop'
  ],
  [CATEGORIES.JEWELRY]: [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop'
  ],
  [CATEGORIES.PERFUMES]: [
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594035910387-fea4779426e9?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616949755610-8c977f9f3b38?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585218356057-da0e62788c6c?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?q=80&w=1000&auto=format&fit=crop'
  ],
  [CATEGORIES.LEATHER]: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?q=80&w=1000&auto=format&fit=crop'
  ],
  [CATEGORIES.GIFT_SETS]: [
    'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1585503418537-88331351ad99?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512909006721-3d6018887383?q=80&w=1000&auto=format&fit=crop'
  ],
  [CATEGORIES.EXCLUSIVE]: [
    'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1602143407151-01114195932e?q=80&w=1000&auto=format&fit=crop'
  ]
};

// פונקציית עזר לבחירת פריט רנדומלי
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min, max) => Math.floor(Math.random() * (max - min + 1) + min) * 10;

// שמות ותארים ליצירת גיוון
const ADJECTIVES = {
  he: ['יוקרתי', 'מלכותי', 'קלאסי', 'מודרני', 'נדיר', 'אקסקלוסיבי', 'מעוצב', 'אלגנטי', 'מוזהב', 'נצחי'],
  en: ['Luxury', 'Royal', 'Classic', 'Modern', 'Rare', 'Exclusive', 'Designer', 'Elegant', 'Golden', 'Timeless']
};

const MATERIALS = {
  he: ['זהב 18K', 'כסף טהור', 'עור איטלקי', 'יהלומים', 'קריסטל', 'עץ מהגוני', 'משי', 'פלדת אל-חלד'],
  en: ['18K Gold', 'Pure Silver', 'Italian Leather', 'Diamonds', 'Crystal', 'Mahogany Wood', 'Silk', 'Stainless Steel']
};

// מחולל מוצרים
const generateProducts = () => {
  const products = [];

  // 1. WATCHES (20 Items)
  const watchNames = ['Chronograph', 'Diver', 'Pilot', 'Dress Watch', 'Tourbillon', 'Automatic', 'GMT Master', 'Skeleton'];
  for (let i = 0; i < 20; i++) {
    const adjHe = getRandom(ADJECTIVES.he);
    const adjEn = getRandom(ADJECTIVES.en);
    const nameBase = getRandom(watchNames);
    const materialHe = getRandom(MATERIALS.he);
    
    products.push({
      name: { 
        he: `שעון ${nameBase} ${adjHe}`, 
        en: `${adjEn} ${nameBase} Watch` 
      },
      description: { 
        he: `שעון יוקרה המשלב ${materialHe} בעיצוב ${adjHe}. מנגנון שוויצרי מדויק ועמידות במים.`, 
        en: `Luxury watch combining ${materialHe} with ${adjEn} design. Precise Swiss movement.` 
      },
      price: getRandomPrice(1500, 55000),
      category: CATEGORIES.WATCHES,
      image: getRandom(IMAGES[CATEGORIES.WATCHES]),
      isPopular: Math.random() > 0.8
    });
  }

  // 2. JEWELRY (25 Items)
  const jewelryTypes = ['טבעת', 'שרשרת', 'עגילים', 'צמיד', 'תליון'];
  const jewelryTypesEn = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant'];
  
  for (let i = 0; i < 25; i++) {
    const idx = Math.floor(Math.random() * jewelryTypes.length);
    const adjHe = getRandom(ADJECTIVES.he);
    const adjEn = getRandom(ADJECTIVES.en);
    
    products.push({
      name: { 
        he: `${jewelryTypes[idx]} ${adjHe}`, 
        en: `${adjEn} ${jewelryTypesEn[idx]}` 
      },
      description: { 
        he: `תכשיט מרהיב בשיבוץ עדין. עבודת יד אומנותית המבטיחה איכות ללא פשרות.`, 
        en: `Spectacular jewelry with delicate setting. Artistic handmade quality without compromise.` 
      },
      price: getRandomPrice(800, 25000),
      category: CATEGORIES.JEWELRY,
      image: getRandom(IMAGES[CATEGORIES.JEWELRY]),
      isPopular: Math.random() > 0.8
    });
  }

  // 3. PERFUMES (20 Items)
  const scents = ['Noir', 'Oud', 'Rose', 'Vanilla', 'Ocean', 'Musk', 'Citrus', 'Amber'];
  for (let i = 0; i < 20; i++) {
    const scent = getRandom(scents);
    const adjEn = getRandom(ADJECTIVES.en);
    
    products.push({
      name: { 
        he: `בושם ${scent} ${adjEn}`, 
        en: `${adjEn} ${scent} Parfum` 
      },
      description: { 
        he: `ניחוח ${scent} עמוק ומשכר שנשאר לאורך זמן. תווים עליונים רעננים ובסיס עצי.`, 
        en: `Deep and intoxicating ${scent} fragrance that lasts. Fresh top notes and woody base.` 
      },
      price: getRandomPrice(450, 1500),
      category: CATEGORIES.PERFUMES,
      image: getRandom(IMAGES[CATEGORIES.PERFUMES]),
      isPopular: Math.random() > 0.7
    });
  }

  // 4. LEATHER (15 Items)
  const leatherItems = ['תיק', 'ארנק', 'חגורה', 'תיק גב'];
  const leatherItemsEn = ['Bag', 'Wallet', 'Belt', 'Backpack'];
  
  for (let i = 0; i < 15; i++) {
    const idx = Math.floor(Math.random() * leatherItems.length);
    const adjHe = getRandom(ADJECTIVES.he);
    
    products.push({
      name: { 
        he: `${leatherItems[idx]} עור ${adjHe}`, 
        en: `${getRandom(ADJECTIVES.en)} Leather ${leatherItemsEn[idx]}` 
      },
      description: { 
        he: `מוצר עור איטלקי משובח בתפירה עילית. משתבח עם השנים ומתאים לכל הופעה.`, 
        en: `Fine Italian leather product with haute couture stitching. Ages beautifully.` 
      },
      price: getRandomPrice(300, 3500),
      category: CATEGORIES.LEATHER,
      image: getRandom(IMAGES[CATEGORIES.LEATHER]),
      isPopular: Math.random() > 0.8
    });
  }

  // 5. GIFT SETS (10 Items)
  for (let i = 0; i < 10; i++) {
    products.push({
      name: { 
        he: `מארז מתנה ${getRandom(ADJECTIVES.he)}`, 
        en: `${getRandom(ADJECTIVES.en)} Gift Set` 
      },
      description: { 
        he: 'המארז המושלם הכולל שילוב של פריטי יוקרה נבחרים. ארוז בקופסה מהודרת.', 
        en: 'The perfect set featuring a combination of selected luxury items. Packaged in an elegant box.' 
      },
      price: getRandomPrice(600, 2000),
      category: CATEGORIES.GIFT_SETS,
      image: getRandom(IMAGES[CATEGORIES.GIFT_SETS]),
      isPopular: Math.random() > 0.6
    });
  }

  // 6. EXCLUSIVE (10 Items)
  const exclusives = ['עט נובע', 'פסל', 'שחמט', 'קראף'];
  const exclusivesEn = ['Fountain Pen', 'Sculpture', 'Chess Set', 'Decanter'];
  
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(Math.random() * exclusives.length);
    
    products.push({
      name: { 
        he: `${exclusives[idx]} ${getRandom(ADJECTIVES.he)}`, 
        en: `${getRandom(ADJECTIVES.en)} ${exclusivesEn[idx]}` 
      },
      description: { 
        he: 'פריט אספנות נדיר במהדורה מוגבלת. למי שמעריך איכות יוצאת דופן.', 
        en: 'Rare limited edition collector item. For those who appreciate exceptional quality.' 
      },
      price: getRandomPrice(2000, 15000),
      category: CATEGORIES.EXCLUSIVE,
      image: getRandom(IMAGES[CATEGORIES.EXCLUSIVE]),
      isPopular: true
    });
  }

  return products;
};

const importData = async () => {
  try {
    await Product.deleteMany();
    console.log('Old products removed...'.red.inverse);

    const products = generateProducts();
    await Product.insertMany(products);
    
    console.log(`Successfully imported ${products.length} luxury items!`.green.inverse);
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

importData();