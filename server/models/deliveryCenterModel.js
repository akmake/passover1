import mongoose from 'mongoose';

const deliveryCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['DeliveryZone', 'Pickup'],
    },
    // שדות עבור אזורי משלוח
    cities: {
      type: [String],
    },
    price: {
      type: Number,
      default: 0,
    },
    // שדות עבור נקודות איסוף
    address: {
        type: String,
    },
    availableDates: { // <-- השדה חזר!
        type: [String],
        default: [],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
  },
  { timestamps: true }
);

deliveryCenterSchema.index({ name: 1, type: 1 }, { unique: true, partialFilterExpression: { type: 'DeliveryZone' } });

const DeliveryCenter =
  mongoose.models.DeliveryCenter ||
  mongoose.model('DeliveryCenter', deliveryCenterSchema);

export default DeliveryCenter;