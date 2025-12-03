// client/src/config/constants.js

export const PRODUCT_CATEGORIES = {
  SALAD: 'salad',
  FISH: 'fish',
  APPETIZER: 'appetizer',
  SOUP: 'soup',
  MAIN_COURSE: 'main_course',
  SIDE_DISH: 'side_dish',
  DAIRY: 'dairy',
  DESSERT: 'dessert',
  DRINK: 'drink',
  SEDER_PLATE: 'seder plate',
};

export const KASHRUT_TYPES = {
  PARVE: 'parve',
  DAIRY: 'dairy',
  MEAT: 'meat',
};

export const ORDER_STATUSES = [
  'התקבלה',
  'בטיפול המטבח',
  'מוכנה למשלוח',
  'בדרך ללקוח',
  'נמסרה',
  'בוטלה'
];

export const DISPLAY_TEXTS = {
  [PRODUCT_CATEGORIES.MAIN_COURSE]: 'מנה עיקרית',
  [PRODUCT_CATEGORIES.SIDE_DISH]: 'תוספת',
  [PRODUCT_CATEGORIES.SALAD]: 'סלט',
  [PRODUCT_CATEGORIES.DESSERT]: 'קינוח',
  [PRODUCT_CATEGORIES.DRINK]: 'שתיה',
  [KASHRUT_TYPES.PARVE]: 'פרווה',
  [KASHRUT_TYPES.DAIRY]: 'חלבי',
  [KASHRUT_TYPES.MEAT]: 'בשרי',
};

export const CATEGORY_DETAILS = {
  [PRODUCT_CATEGORIES.SALAD]:       { title: 'סלטים', order: 1 },
  [PRODUCT_CATEGORIES.FISH]:        { title: 'דגים', order: 2 },
  [PRODUCT_CATEGORIES.APPETIZER]:   { title: 'ביניים', order: 3 },
  [PRODUCT_CATEGORIES.SOUP]:        { title: 'מרק', order: 4 },
  [PRODUCT_CATEGORIES.MAIN_COURSE]: { title: 'עיקריות', order: 5 },
  [PRODUCT_CATEGORIES.SIDE_DISH]:   { title: 'תוספות', order: 6 },
  package:                          { title: 'החבילות המשפחתיות', order: 7 },
  [PRODUCT_CATEGORIES.DAIRY]:       { title: 'חלבי', order: 8 },
  [PRODUCT_CATEGORIES.DESSERT]:     { title: 'קינוחים ועוגות', order: 9 },
  [PRODUCT_CATEGORIES.DRINK]:       { title: 'שתיה', order: 10 },
  [PRODUCT_CATEGORIES.SEDER_PLATE]: { title: 'קערת ליל סדר', order: 11 },
};