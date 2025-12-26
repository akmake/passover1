import express from "express";
import HomeMedia from "../models/HomeMedia.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public: fetch current home media (singleton)
router.get("/homepage-media", async (req, res) => {
  let doc = await HomeMedia.findOne();
  if (!doc) {
    // Seed defaults once (so the site doesn't break on first run)
    doc = await HomeMedia.create({
      hero: {
        videoUrl: "",
        posterUrl: "",
        overlayImageUrl: ""
      },
      categories: [
        {
          id: 1,
          title: "WEDDINGS",
          hebrewTitle: "חתונות ואירועים",
          subtitle: "עיצוב בלתי נשכח לרגעים הגדולים",
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop",
          link: "/menu?category=wedding"
        },
        {
          id: 2,
          title: "VIP GIFTS",
          hebrewTitle: "מארזי יוקרה",
          subtitle: "כשרוצים להעניק את הטוב ביותר",
          imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2040&auto=format&fit=crop",
          link: "/menu?category=holidays"
        },
        {
          id: 3,
          title: "BESPOKE",
          hebrewTitle: "בהתאמה אישית",
          subtitle: "אומנות היצירה לפי החזון שלך",
          imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop",
          link: "/package-builder"
        }
      ],
      featured: [
        {
          id: 1,
          name: "The Royal Box",
          price: "₪850",
          imageUrl: "https://images.unsplash.com/photo-1599639668312-3b1a5e4774b6?q=80&w=1974&auto=format&fit=crop"
        },
        {
          id: 2,
          name: "Golden Orchid",
          price: "₪420",
          imageUrl: "https://images.unsplash.com/photo-1566679056263-633ca56e8fb5?q=80&w=1974&auto=format&fit=crop"
        },
        {
          id: 3,
          name: "Black Velvet",
          price: "₪380",
          imageUrl: "https://images.unsplash.com/photo-1544523927-4493d56f1406?q=80&w=1974&auto=format&fit=crop"
        }
      ],
      bespoke: {
        imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop"
      }
    });
  }

  res.json(doc);
});

// Admin: update the singleton
router.put("/admin/homepage-media", requireAuth, requireAdmin, async (req, res) => {
  const payload = req.body;

  // אופציונלי אבל מומלץ: ולידציה בסיסית למניעת javascript: וכו'
  const isSafeUrl = (u) =>
    typeof u === "string" &&
    (u === "" || u.startsWith("http://") || u.startsWith("https://"));

  // דוגמא: בדיקת שדות מדיה קריטיים
  if (payload?.hero) {
    for (const k of ["videoUrl", "posterUrl", "overlayImageUrl"]) {
      if (k in payload.hero && !isSafeUrl(payload.hero[k])) {
        return res.status(400).json({ message: `Invalid URL in hero.${k}` });
      }
    }
  }

  const updated = await HomeMedia.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  });

  res.json(updated);
});

export default router;
