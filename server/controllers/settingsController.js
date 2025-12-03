import GeneralSettings from '../models/generalSettingsModel.js';

// @desc    Get public general settings (like free shipping threshold)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = async (req, res) => {
    try {
        let settings = await GeneralSettings.findOne({ identifier: 'main' });
        if (!settings) {
            // אם אין הגדרות, החזר ערכי ברירת מחדל בטוחים
            return res.json({ freeShippingThreshold: 99999 });
        }
        res.json({ freeShippingThreshold: settings.freeShippingThreshold });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};