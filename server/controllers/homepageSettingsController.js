import HomepageSettings from '../models/homepageSettingsModel.js';

const defaultHomepageLayout = {
  identifier: 'main-settings',
  sections: [
    {
      type: 'hero',
      content: {
        mode: 'slideshow',
        slideshowInterval: 5,
        slides: [
          {
            id: 'slide1',
            image: '/uploads/default-hero.jpg',
            video: '', // חדש
            headline: '<h1><strong>ברוכים הבאים לקייטרינג פלוס</strong></h1>',
            subheadline: '<p>ניהול מלא של התוכן דרך פאנל הניהול החדש והגמיש.</p>',
          }
        ]
      },
    },
    {
      type: 'richText',
      content: {
        title: '<h2>כותרת טקסט לדוגמה</h2>',
        text: '<p>זהו תוכן שניתן לערוך באופן מלא, כולל <strong>הדגשות</strong>, <em>הטיות</em> וצבעים.</p>'
      }
    }
  ],
};
// ... (getHomepageSettings and updateHomepageSettings functions remain the same)
export const getHomepageSettings = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne({ identifier: 'main-settings' });
    if (!settings) {
      settings = await HomepageSettings.create(defaultHomepageLayout);
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};
export const updateHomepageSettings = async (req, res) => {
  try {
    const { sections } = req.body;
    const settings = await HomepageSettings.findOneAndUpdate(
      { identifier: 'main-settings' },
      { sections },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};