import DeliveryCenter from '../models/deliveryCenterModel.js';
import DeliveryDate from '../models/deliveryDateModel.js'; // <-- 1. הוסף ייבוא


// @desc    Fetch all active delivery options for public view
// @route   GET /api/delivery-options
// @access  Public
export const getPublicDeliveryOptions = async (req, res) => {
  try {
    const options = await DeliveryCenter.find({ isActive: true });
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
// @desc    Fetch all active global delivery dates
// @route   GET /api/delivery-options/dates
// @access  Public
export const getPublicDeliveryDates = async (req, res) => {
  try {
    const dates = await DeliveryDate.find({ isActive: true }).sort({ date: 1 });
    res.json(dates.map(d => d.date));
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};