import mongoose from "mongoose";

const HomeMediaSchema = new mongoose.Schema(
  {
    hero: {
      videoUrl: { type: String, default: "" },       // mp4
      posterUrl: { type: String, default: "" },      // image
      overlayImageUrl: { type: String, default: "" } // image מעל הווידאו (כמו אצלך)
    },

    categories: [
      {
        id: { type: Number, required: true },
        title: { type: String, required: true },
        hebrewTitle: { type: String, required: true },
        subtitle: { type: String, default: "" },
        imageUrl: { type: String, required: true },
        link: { type: String, required: true }
      }
    ],

    featured: [
      {
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: String, required: true },
        imageUrl: { type: String, required: true }
      }
    ],

    bespoke: {
      imageUrl: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export default mongoose.model("HomeMedia", HomeMediaSchema);
