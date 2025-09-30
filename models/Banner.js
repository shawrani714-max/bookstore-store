const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 100 },
  subtitle: { type: String, trim: true, maxlength: 180 },
  imageUrl: { type: String, required: true },
  publicId: { type: String },
  ctaText: { type: String, trim: true, maxlength: 40 },
  ctaLink: { type: String, trim: true, maxlength: 200 },
  overlay: { type: Boolean, default: false },
  textColor: { type: String, default: '#ffffff' },
  ctaColor: { type: String, default: '#ffffff' },
  ctaBg: { type: String, default: '#e94e77' },
  order: { type: Number, default: 0, index: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);


