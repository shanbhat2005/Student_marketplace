const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // [Buyer, Seller]
  }],
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  },
  lastMessage: {
    text: String,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
