// client/src/config/constants.js

export const PRODUCT_CATEGORIES = {
  WATCHES: 'watches',
  JEWELRY: 'jewelry',
  PERFUMES: 'perfumes',
  LEATHER_GOODS: 'leather_goods',
  HOME_DECOR: 'home_decor',
  GIFT_SETS: 'gift_sets',
  EXCLUSIVE: 'exclusive',
};

// מחק את KASHRUT_TYPES אם לא רלוונטי, או שנה ל"מותגים"

export const DISPLAY_TEXTS = {
  [PRODUCT_CATEGORIES.WATCHES]: 'שעוני יוקרה',
  [PRODUCT_CATEGORIES.JEWELRY]: 'תכשיטים',
  [PRODUCT_CATEGORIES.PERFUMES]: 'בישום',
  [PRODUCT_CATEGORIES.LEATHER_GOODS]: 'מוצרי עור',
  [PRODUCT_CATEGORIES.HOME_DECOR]: 'עיצוב הבית',
  [PRODUCT_CATEGORIES.GIFT_SETS]: 'מארזי מתנה',
  [PRODUCT_CATEGORIES.EXCLUSIVE]: 'בלעדי לאתר',
};

export const CATEGORY_DETAILS = {
  [PRODUCT_CATEGORIES.EXCLUSIVE]:   { title: 'הקולקציה הבלעדית', order: 1 },
  [PRODUCT_CATEGORIES.WATCHES]:     { title: 'שעונים', order: 2 },
  [PRODUCT_CATEGORIES.JEWELRY]:     { title: 'תכשיטים', order: 3 },
  // ... וכן הלאה
};