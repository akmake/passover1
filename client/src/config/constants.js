// client/src/config/constants.js

export const PRODUCT_CATEGORIES = {
  FURNITURE: 'furniture',    // ריהוט
  LIGHTING: 'lighting',      // תאורה
  TEXTILES: 'textiles',      // טקסטיל
  DECOR: 'decor',            // אקססוריז ונוי
  ART: 'art',                // אומנות
  SCENTS: 'scents',          // ריחות ונרות
  KITCHEN: 'kitchen',        // מטבח ואירוח
};

export const CATEGORY_DETAILS = {
  [PRODUCT_CATEGORIES.FURNITURE]: { title: 'Furniture Collection', order: 1 },
  [PRODUCT_CATEGORIES.LIGHTING]:  { title: 'Lighting & Ambience', order: 2 },
  [PRODUCT_CATEGORIES.TEXTILES]:  { title: 'Soft Textiles', order: 3 },
  [PRODUCT_CATEGORIES.DECOR]:     { title: 'Home Decor', order: 4 },
  [PRODUCT_CATEGORIES.ART]:       { title: 'Wall Art', order: 5 },
  [PRODUCT_CATEGORIES.SCENTS]:    { title: 'Fragrance', order: 6 },
  [PRODUCT_CATEGORIES.KITCHEN]:   { title: 'Tableware', order: 7 },
};

export const ORDER_STATUSES = [
  'התקבלה',
  'בטיפול',
  'נארזה',
  'נשלחה',
  'נמסרה',
  'בוטלה'
];

// אובייקט עזר לתרגום מהיר אם צריך
export const DISPLAY_TEXTS = {
  [PRODUCT_CATEGORIES.FURNITURE]: 'ריהוט',
  [PRODUCT_CATEGORIES.LIGHTING]: 'תאורה',
  [PRODUCT_CATEGORIES.TEXTILES]: 'טקסטיל',
  [PRODUCT_CATEGORIES.DECOR]: 'עיצוב',
  [PRODUCT_CATEGORIES.ART]: 'אומנות',
  [PRODUCT_CATEGORIES.SCENTS]: 'בישום',
  [PRODUCT_CATEGORIES.KITCHEN]: 'מטבח',
};