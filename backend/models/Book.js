const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  semester: {
    type: Number,
    required: true,
  },
  course: {
    type: String,
    enum: ['BCA', 'BBA'],
    required: true,
    default: 'BCA'
  },
  imageUrl: {
    type: String,
    required: false,
  },
  contactEmail: {
    type: String,
    required: false,
    trim: true,
  },
  condition: {
    type: String,
    enum: ['New', 'Used'],
    required: true,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Book', bookSchema);
