const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.models.Page || mongoose.model('Page', pageSchema);
