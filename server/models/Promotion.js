import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  discountPrice: { 
    type: Number, 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model('Promotion', promotionSchema);