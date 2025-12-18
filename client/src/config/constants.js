// client/src/config/constants.js

export const PRODUCT_CATEGORIES = {
  FLOWERS: 'flowers',
  GIFTS: 'gifts',
  DINNERWARE: 'dinnerware',
  CHOCOLATE: 'chocolate',
  DECOR: 'decor',
  PACKAGES: 'packages'
};

export const CATEGORY_DETAILS = {
  [PRODUCT_CATEGORIES.FLOWERS]:     { title: 'זרי פרחים', order: 1 },
  [PRODUCT_CATEGORIES.GIFTS]:       { title: 'מארזי מתנה', order: 2 },
  [PRODUCT_CATEGORIES.DINNERWARE]:  { title: 'מערכות אוכל', order: 3 },
  [PRODUCT_CATEGORIES.CHOCOLATE]:   { title: 'שוקולד ופרלינים', order: 4 },
  [PRODUCT_CATEGORIES.DECOR]:       { title: 'עיצוב הבית', order: 5 },
  [PRODUCT_CATEGORIES.PACKAGES]:    { title: 'חבילות ומבצעים', order: 6 },
};

export const ORDER_STATUSES = [
  'התקבלה',
  'בטיפול',
  'נשזרה/נארזה',
  'נשלחה',
  'נמסרה',
  'בוטלה'
];

export const DISPLAY_TEXTS = {
  [PRODUCT_CATEGORIES.FLOWERS]: 'פרחים ועיצובים',
  [PRODUCT_CATEGORIES.GIFTS]: 'מתנות יוקרה',
  [PRODUCT_CATEGORIES.DINNERWARE]: 'בריליאנט - כלי אירוח',
  [PRODUCT_CATEGORIES.CHOCOLATE]: 'שוקולטינה',
  [PRODUCT_CATEGORIES.DECOR]: 'אקססוריז לבית',
  [PRODUCT_CATEGORIES.PACKAGES]: 'מארזי חג וועדים',
};