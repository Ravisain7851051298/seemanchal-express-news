const mongoose = require('../config/mysql-odm');

const siteSettingsSchema = new mongoose.Schema(
  {
    organizationName: {
      type: String,
      default: 'Seemanchal Express',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Voice of the People | सच की निर्भीक आवाज',
      trim: true,
    },
    // Official Seal & Signatures for Appointment Letters and ID Cards
    credentials: {
      officialSeal: {
        type: String,
        default: '', // Image URL for official round stamp/seal
      },
      presidentSignature: {
        type: String,
        default: '', // Image URL for Nation Correspondence / Chief Editor signature
      },
      signatoryName: {
        type: String,
        default: 'Nation Correspondence / Chief Editor',
      },
      signatoryDesignation: {
        type: String,
        default: 'Editor-in-Chief & Central Secretariat',
      },
    },
    // Dynamic Social Media Links
    socialLinks: {
      facebook: {
        type: String,
        default: 'https://facebook.com/seemanchalexpress',
      },
      twitter: {
        type: String,
        default: 'https://twitter.com/seemanchalexp',
      },
      instagram: {
        type: String,
        default: 'https://instagram.com/seemanchalexpress',
      },
      youtube: {
        type: String,
        default: 'https://youtube.com/@seemanchalexpress',
      },
      telegram: {
        type: String,
        default: 'https://t.me/seemanchalexpress',
      },
      whatsapp: {
        type: String,
        default: 'https://whatsapp.com/channel/seemanchalexpress',
      },
      linkedin: {
        type: String,
        default: '',
      },
    },
    // Dynamic About Us Page Content
    aboutUs: {
      title: {
        type: String,
        default: 'Seemanchal Express (सीमांचल एक्सप्रेस)',
      },
      subtitle: {
        type: String,
        default: 'Voice of the People | सच की निर्भीक आवाज',
      },
      mission: {
        type: String,
        default:
          'To bring the pressing challenges of Seemanchal (Kishanganj, Araria, Purnea, and Katihar) — including flood control, quality education, healthcare infrastructure, and rural economic empowerment — to the forefront of national policy, driving positive democratic change.',
      },
      vision: {
        type: String,
        default:
          'Truth, impartiality, fearless reporting without political bias, amplifying the voices of marginalized communities, and safeguarding constitutional and democratic values represent the unwavering pillars of Seemanchal Express.',
      },
      detailedContent: {
        type: String,
        default: '',
      },
      bannerImage: {
        type: String,
        default: '',
      },
    },
    // Dynamic Contact Us Page Content
    contactUs: {
      headquartersAddress: {
        type: String,
        default: 'F 65, Shaheen Bagh, Okhla, New Delhi-110025, India',
      },
      phone: {
        type: String,
        default: '+91 9871023184',
      },
      alternatePhone: {
        type: String,
        default: '',
      },
      email: {
        type: String,
        default: 'mail@seemanchalexpress.in',
      },
      supportEmail: {
        type: String,
        default: 'editor@seemanchalexpress.in',
      },
      whatsappNumber: {
        type: String,
        default: '+91 9871023184',
      },
      officeHours: {
        type: String,
        default: 'Monday - Saturday: 9:00 AM - 8:00 PM IST',
      },
      mapEmbedUrl: {
        type: String,
        default: '',
      },
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Helper function to get or initialize default settings singleton
siteSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);

