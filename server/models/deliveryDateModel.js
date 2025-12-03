import mongoose from 'mongoose';

const deliveryDateSchema = new mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
            unique: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
            description: 'תאריך זמין למשלוח בפורמט YYYY-MM-DD',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const DeliveryDate = mongoose.models.DeliveryDate || mongoose.model('DeliveryDate', deliveryDateSchema);

export default DeliveryDate;