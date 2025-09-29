const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  details: { type: String },
  admin: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);