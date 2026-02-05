const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// POST route to create a new book
router.post('/', async (req, res) => {
  try {
    const book = new Book(req.body);
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET route to fetch all books
router.get('/', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET route to fetch books by semester
router.get('/semester/:semester', async (req, res) => {
  try {
    const semester = parseInt(req.params.semester);
    if (semester < 1 || semester > 6) {
      return res.status(400).json({ error: 'Semester must be between 1 and 6' });
    }
    const books = await Book.find({ semester: semester }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
