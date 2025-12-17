export const PRODUCT_CATEGORIES = {
  FLOWERS: 'flowers',       // זרי פרחים וסידורים
  GIFTS: 'gifts',           // מארזי שי, ליולדת, לכלה
  DINNERWARE: 'dinnerware', // מערכות אוכל וסכו"ם (בריליאנט)
  CHOCOLATE: 'chocolate',   // פרלינים (שוקולטינה)
  DECOR: 'decor',           // עיצוב שולחן ובית
  PACKAGES: 'packages'      // ועדי עובדים / חבילות מוכנות
};

export const CATEGORY_DETAILS = {
  [PRODUCT_CATEGORIES.FLOWERS]:     { title: 'Flowers & Design', order: 1 },
  [PRODUCT_CATEGORIES.DINNERWARE]:  { title: 'Brilliant Tableware', order: 2 },
  [PRODUCT_CATEGORIES.CHOCOLATE]:   { title: 'Chocolatina', order: 3 },
  [PRODUCT_CATEGORIES.GIFTS]:       { title: 'Luxury Gifts', order: 4 },
  [PRODUCT_CATEGORIES.DECOR]:       { title: 'Home Decor', order: 5 },
  [PRODUCT_CATEGORIES.PACKAGES]:    { title: 'Special Collections', order: 6 },
};

export const ORDER_STATUSES = [
  'התקבלה',
  'בטיפול',
  'נשזרה/נארזה', // מותאם אישית
  'נשלחה',
  'נמסרה',
  'בוטלה'
];

export const DISPLAY_TEXTS = {
  [PRODUCT_CATEGORIES.FLOWERS]: 'זרי פרחים',
  [PRODUCT_CATEGORIES.DINNERWARE]: 'מערכות אוכל',
  [PRODUCT_CATEGORIES.CHOCOLATE]: 'שוקולד ופרלינים',
  [PRODUCT_CATEGORIES.GIFTS]: 'מתנות ומארזים',
  [PRODUCT_CATEGORIES.DECOR]: 'עיצוב הבית',
  [PRODUCT_CATEGORIES.PACKAGES]: 'קולקציות מיוחדות',
};