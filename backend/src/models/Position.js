const mongoose = require('../config/mysql-odm');

const positionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  committeeLevel: {
    type: String,
    enum: ['National', 'State', 'District', 'Block', 'Panchayat', 'Ward', 'Press', 'General', 'None'],
    required: true,
  },
  committeeName: {
    type: String,
    required: true,
    trim: true,
  },
  maxSeats: {
    type: String,
    default: '1',
  },
  order: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Position', positionSchema);
