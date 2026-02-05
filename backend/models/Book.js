const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  semester: {
    type: Number,
    min: 1,
    max: 6
  },
  condition: {
    type: String,
    enum: ['Good', 'Like New', 'Fair', 'Poor']
  },
  imageURL: {
    type: String
  },
  sellerName: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);
