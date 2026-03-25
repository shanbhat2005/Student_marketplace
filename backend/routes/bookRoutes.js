const express = require('express');
const router = express.Router();
const Book = require('../models/Book');


// POST /add - Add a new book
router.post('/add', async (req, res) => {
  try {
    const { title, author, price, semester, condition, owner } = req.body;

    if (!title || !author || price == null || !semester || !condition) {
      return res
        .status(400)
        .json({ message: 'title, author, price, semester, and condition are required.' });
    }

    const bookData = { title, author, price, semester, condition };
    if (owner) bookData.owner = owner;
    const book = new Book(bookData);
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

// POST /:id/buy - Buy a book
router.post('/:id/buy', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { buyerEmail } = req.body;

    if (!buyerEmail) {
      return res.status(400).json({ message: 'Buyer email is required.' });
    }

    const book = await Book.findById(bookId).populate('owner');
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found or already sold.' });
    }

    await Book.findByIdAndDelete(bookId);

    res.json({ message: 'Purchase successful!' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Server error processing purchase', error: error.message });
  }
});

module.exports = router;
