const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  recipientLinkId: {
    type: String,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index pour suppression automatique après 48h
    expires: 172800 // 48h en secondes
  },
  isRead: {
    type: Boolean,
    default: false
  }
});

// Index pour optimiser les recherches et le TTL
messageSchema.index({ recipientLinkId: 1 });
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);