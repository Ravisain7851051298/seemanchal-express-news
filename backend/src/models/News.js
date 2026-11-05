const mongoose = require('../config/mysql-odm');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  categoryName: {
    type: String,
    default: '',
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  categoryNames: [{
    type: String,
    trim: true,
  }],
  content: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: '/uploads/default-news.jpg',
  },
  videoUrl: {
    type: String,
    default: '',
    trim: true,
  },
  images: [{
    type: String,
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: 'Seemanchal, Bihar',
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'published', 'rejected'],
    default: 'published', // If admin creates, published by default. If reporter creates, 'pending'
  },
  isBreaking: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  hasWatermark: {
    type: Boolean,
    default: false,
  },
  watermarkPhoto: {
    type: Boolean,
    default: false,
  },
  watermarkVideo: {
    type: Boolean,
    default: false,
  },
  policyAccepted: {
    type: Boolean,
    default: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: String,
  }],
  rejectionReason: {
    type: String,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for search
newsSchema.index({ title: 'text', content: 'text', tags: 'text', location: 'text' });

module.exports = mongoose.model('News', newsSchema);
