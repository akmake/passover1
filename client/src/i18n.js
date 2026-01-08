// client/src/i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// פונקציית עזר למניעת קריסות (נשארה מהקוד המקורי)
export const getSafeName = (nameObj, lang) => {
  if (!nameObj) return "";
  if (typeof nameObj === "string") return nameObj;
  return lang === "he" ? (nameObj.he || nameObj.en) : (nameObj.en || nameObj.he);
};

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",
        menu: "Menu",
        about: "About",
        contact: "Contact",
        admin: "Admin Dashboard",
        login: "Login",
        logout: "Logout",
        cart: "Cart"
      },
      hero: {
        title: "Alei Zahav",
        subtitle: "Luxury Catering & Events",
        cta: "Order Now",
        scroll: "Scroll Down"
      },
      menu: {
        title: "Our Menu",
        filter_all: "All",
        search_placeholder: "Search for dishes...",
        no_items: "No items found",
        quick_view: "Quick View",
        add_to_cart: "Add to Cart",
        sale: "On Sale"
      },
      cart: {
        title: "Your Cart",
        empty: "Your cart is empty",
        checkout: "Checkout",
        total: "Total",
        remove: "Remove",
        subtotal: "Subtotal ({{count}} items)"
      },
      product: {
        quantity: "Quantity",
        add_to_cart: "Add to Cart",
        no_description: "No description available.",
        best_seller: "BEST SELLER",
        add_sale: "Add (Sale)"
      },
      // --- הוספתי את כל החלק החסר של ה-Checkout ---
      checkout: {
        title: "Checkout",
        secure: "Secure Payment",
        noDateSelected: "No date selected",
        fulfillmentMethod: "Delivery Method",
        delivery: "Delivery",
        toYourDoor: "To your doorstep",
        pickup: "Self Pickup",
        fromPickupPoint: "From our collection point",
        selectDate: "Select Date",
        noDatesAvailable: "No available dates currently",
        details: {
          title: "Shipping Details",
          deliveryZone: "Delivery Zone",
          required: "Required",
          specialZone: "Special Zone",
          noZonesAvailable: "No delivery zones available",
          pickupPoint: "Pickup Point"
        },
        summary: {
          title: "Order Summary",
          itemsPrice: "Items Subtotal",
          couponDiscount: "Coupon Discount",
          shippingCost: "Shipping",
          free: "FREE",
          total: "Final Total"
        },
        coupon: {
          title: "Have a coupon?",
          applied: "Coupon {{code}} applied",
          remove: "Remove",
          placeholder: "Enter coupon code",
          apply: "Apply"
        },
        payment: {
          submit: "Place Order",
          secureNote: "By placing this order, you agree to our Terms of Service"
        },
        errors: {
          chooseMethod: "Please select a delivery method",
          chooseDate: "Please select a date",
          fillDetails: "Please fill in all personal details",
          fillAddress: "Please fill in all address details and select a zone",
          choosePickupPoint: "Please select a pickup point",
          orderFailed: "Order creation failed. Please try again.",
          minPurchaseRequired: "Minimum purchase of ₪{{amount}} required for this coupon"
        }
      },
      form: {
        fullName: "Full Name",
        phone: "Phone Number",
        email: "Email Address",
        city: "City",
        streetAddress: "Street Address",
        apartment: "Apartment",
        floor: "Floor",
        deliveryNotes: "Delivery Notes / Gate Code",
        deliveryNotesPlaceholder: "Any relevant details for the driver...",
        pickupNotes: "Pickup Notes",
        pickupNotesPlaceholder: "Special requests..."
      },
      common: {
        loading: "Loading...",
        success: "Success!",
        error: "Error",
        close: "Close",
        closePanel: "Close panel",
        remove: "Remove"
      }
    }
  },
  he: {
    translation: {
      nav: {
        home: "בית",
        menu: "תפריט",
        about: "אודות",
        contact: "צור קשר",
        admin: "ממשק ניהול",
        login: "התחברות",
        logout: "התנתק",
        cart: "עגלה"
      },
      hero: {
        title: "עלי זהב",
        subtitle: "מתנות יוקרתיות",
        cta: "הזמן עכשיו",
        scroll: "גלול למטה"
      },
      menu: {
        title: "התפריט שלנו",
        filter_all: "הכל",
        search_placeholder: "חפש מנות...",
        no_items: "לא נמצאו פריטים",
        quick_view: "צפייה מהירה",
        add_to_cart: "הוסף לעגלה",
        sale: "במבצע"
      },
      cart: {
        title: "העגלה שלך",
        empty: "העגלה שלך ריקה",
        checkout: "לקופה",
        total: "סה״כ לתשלום",
        remove: "הסר",
        subtotal: "ביניים ({{count}} פריטים)"
      },
      product: {
        quantity: "כמות",
        add_to_cart: "הוסף לעגלה",
        no_description: "אין תיאור זמין.",
        best_seller: "הנמכר ביותר",
        add_sale: "הוסף במבצע"
      },
      // --- החלק החדש והמתורגם לעברית ---
      checkout: {
        title: "סיום הזמנה",
        secure: "תשלום מאובטח",
        noDateSelected: "לא נבחר תאריך",
        fulfillmentMethod: "שיטת קבלה",
        delivery: "משלוח עד הבית",
        toYourDoor: "מגיע אליך עד הדלת",
        pickup: "איסוף עצמי",
        fromPickupPoint: "איסוף מנקודת החלוקה",
        selectDate: "בחר תאריך",
        noDatesAvailable: "אין תאריכים זמינים כרגע",
        details: {
          title: "פרטי הזמנה",
          deliveryZone: "אזור חלוקה",
          required: "חובה",
          specialZone: "אזור מיוחד",
          noZonesAvailable: "אין אזורי חלוקה זמינים",
          pickupPoint: "נקודת איסוף"
        },
        summary: {
          title: "סיכום הזמנה",
          itemsPrice: "סכום ביניים",
          couponDiscount: "הנחת קופון",
          shippingCost: "משלוח",
          free: "חינם",
          total: "סה״כ לתשלום"
        },
        coupon: {
          title: "יש לך קופון?",
          applied: "קופון {{code}} הופעל",
          remove: "הסר",
          placeholder: "הזן קוד קופון",
          apply: "הפעל"
        },
        payment: {
          submit: "בצע הזמנה",
          secureNote: "בלחיצה על ביצוע הזמנה הנך מסכים לתנאי השימוש"
        },
        errors: {
          chooseMethod: "אנא בחר שיטת משלוח",
          chooseDate: "אנא בחר תאריך",
          fillDetails: "אנא מלא את כל הפרטים האישיים",
          fillAddress: "אנא מלא כתובת ובחר אזור חלוקה",
          choosePickupPoint: "אנא בחר נקודת איסוף",
          orderFailed: "שגיאה ביצירת ההזמנה, אנא נסה שנית",
          minPurchaseRequired: "נדרשת רכישה במינימום ₪{{amount}} למימוש הקופון"
        }
      },
      form: {
        fullName: "שם מלא",
        phone: "טלפון נייד",
        email: "כתובת אימייל",
        city: "עיר",
        streetAddress: "רחוב ומספר",
        apartment: "דירה",
        floor: "קומה",
        deliveryNotes: "הערות לשליח / קוד לשער",
        deliveryNotesPlaceholder: "כל פרט שיעזור לשליח להגיע...",
        pickupNotes: "הערות לאיסוף",
        pickupNotesPlaceholder: "בקשות מיוחדות..."
      },
      common: {
        loading: "טוען...",
        success: "בוצע בהצלחה!",
        error: "שגיאה",
        close: "סגור",
        closePanel: "סגור חלונית",
        remove: "הסר"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: "he", // ברירת מחדל עברית
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

// טיפול בכיוון הדף (RTL/LTR) בעת טעינה ושינוי שפה
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;