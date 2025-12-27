import express from "express";
// תיקון: שיניתי את הייבוא לשם המדויק שמופיע בקונטרולר שלך (getPublicCategories)
import { getPublicCategories, createCategory } from "../controllers/categoryController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// תיקון: שימוש בפונקציה הנכונה
router.get("/", getPublicCategories);

// יצירת קטגוריה (מוגן)
router.post("/", requireAuth, requireAdmin, createCategory);

export default router;