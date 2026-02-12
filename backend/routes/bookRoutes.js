const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// POST /add - Add a new book
router.post('/add', async (req, res) => {
  try {
    const { title, author, price, semester, condition, owner } = req.body;

    if (!title || !author || price == null || !semester || !condition || !owner) {
      return res
        .status(400)
        .json({ message: 'title, author, price, semester, condition, and owner are required.' });
    }

    const book = new Book({ title, author, price, semester, condition, owner });
    const savedBook = await book.save();

    return res.status(201).json({
      message: 'Book added successfully.',
      book: savedBook,
    });
  } catch (error) {
    console.error('Error adding book:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Existing routes (optional): list and filter books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }).populate('owner', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/semester/:semester', async (req, res) => {
  try {
    const semester = parseInt(req.params.semester, 10);

    const books = await Book.find({ semester }).sort({ createdAt: -1 }).populate('owner', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
