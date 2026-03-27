const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// POST /api/messages/conversation
// Initialize or return existing conversation between buyer and seller
router.post('/conversation', async (req, res) => {
  try {
    const { buyerId, sellerId, bookId } = req.body;
    
    // Check if conversation already exists for this exact book
    let conversation = await Conversation.findOne({
      participants: { $all: [buyerId, sellerId] },
      book: bookId
    }).populate('participants', 'name email').populate('book', 'title imageUrl');
    
    if (!conversation) {
      conversation = new Conversation({
        participants: [buyerId, sellerId],
        book: bookId
      });
      await conversation.save();
      // populate for response
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email').populate('book', 'title imageUrl');
    }
    
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/conversations/:userId
// Get all open conversations for a user
router.get('/conversations/:userId', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: { $in: [req.params.userId] }
    }).populate('participants', 'name email').populate('book', 'title imageUrl').sort({ updatedAt: -1 });
    
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/messages/:conversationId
// Get messages for a specific conversation
router.get('/:conversationId', async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId
    }).sort({ createdAt: 1 }); // Oldest first for chat UI
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages
// Send a new message
router.post('/', async (req, res) => {
  try {
    const { conversationId, sender, text } = req.body;
    
    const message = new Message({ conversationId, sender, text });
    await message.save();
    
    // Update the conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: { text, sender } 
    });
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
