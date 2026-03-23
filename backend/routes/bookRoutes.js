const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

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

    const sellerEmail = book.owner ? book.owner.email : process.env.EMAIL_USER;

    const mailOptionsBuyer = {
      from: process.env.EMAIL_USER,
      to: buyerEmail,
      subject: `Order Confirmation: ${book.title}`,
      text: `Hello!\n\nYou have successfully placed an order for "${book.title}" by ${book.author}.\nPrice: ${book.price}\n\nThe seller will contact you shortly to arrange the handover.`
    };

    const mailOptionsSeller = {
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: `Book Sold: ${book.title}!`,
      text: `Great news!\n\nYour book "${book.title}" was just ordered on the marketplace.\nPrice: ${book.price}\n\nThe buyer's contact email is: ${buyerEmail}.\nPlease email them as soon as possible to arrange the handover!`
    };

    await transporter.sendMail(mailOptionsBuyer);
    await transporter.sendMail(mailOptionsSeller);

    await Book.findByIdAndDelete(bookId);

    res.json({ message: 'Purchase successful and emails sent!' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Server error processing purchase', error: error.message });
  }
});

module.exports = router;
