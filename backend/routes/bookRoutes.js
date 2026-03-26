const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const Order = require('../models/Order');
const multer = require('multer');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST /add - Add a new book
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { title, author, price, semester, condition, course, owner } = req.body;

    let imageUrl = '';
    if (req.file) {
      imageUrl = '/uploads/' + req.file.filename;
    }

    if (!title || !author || price == null || !semester || !condition || !course) {
      return res
        .status(400)
        .json({ message: 'title, author, price, semester, condition, and course are required.' });
    }

    const bookData = { title, author, price, semester, condition, course };
    if (imageUrl) bookData.imageUrl = imageUrl;
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
    const books = await Book.find({ isSold: { $ne: true } }).sort({ createdAt: -1 }).populate('owner', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/semester/:semester', async (req, res) => {
  try {
    const semester = parseInt(req.params.semester, 10);

    const books = await Book.find({ semester, isSold: { $ne: true } }).sort({ createdAt: -1 }).populate('owner', 'name email');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /:id/buy - Buy a book
router.post('/:id/buy', async (req, res) => {
  try {
    const bookId = req.params.id;
    const { buyerEmail, buyerId } = req.body;

    if (!buyerEmail) {
      return res.status(400).json({ message: 'Buyer email is required.' });
    }

    const book = await Book.findById(bookId).populate('owner');
    
    if (!book || book.isSold) {
      return res.status(404).json({ message: 'Book not found or already sold.' });
    }

    if (buyerId) {
      const order = new Order({
        buyer: buyerId,
        bookTitle: book.title,
        bookAuthor: book.author,
        price: book.price,
        sellerEmail: book.owner ? book.owner.email : process.env.EMAIL_USER
      });
      await order.save();
      
      const Notification = require('../models/Notification');
      // Notify the buyer
      const buyerNotification = new Notification({
        user: buyerId,
        message: `You successfully purchased "${book.title}".`
      });
      await buyerNotification.save();
      
      // Notify the seller
      if (book.owner) {
        const sellerNotification = new Notification({
          user: book.owner._id,
          message: `Great news! Your book "${book.title}" was purchased. Please contact ${buyerEmail} to arrange delivery.`
        });
        await sellerNotification.save();
      }
    }

    book.isSold = true;
    await book.save();

    res.json({ message: 'Purchase successful!' });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ message: 'Server error processing purchase', error: error.message });
  }
});

// DELETE /admin/:id - Admin delete a book
router.delete('/admin/:id', async (req, res) => {
  try {
    const { adminSecret } = req.body;
    const requiredSecret = process.env.ADMIN_SECRET || 'admin123';

    if (!adminSecret || adminSecret !== requiredSecret) {
      return res.status(401).json({ message: 'Unauthorized: Invalid Admin Secret.' });
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Error admin deleting book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT /admin/:id - Admin edit a book
router.put('/admin/:id', upload.single('image'), async (req, res) => {
  try {
    const { adminSecret, title, author, price, semester, course } = req.body;
    const requiredSecret = process.env.ADMIN_SECRET || 'admin123';

    if (!adminSecret || adminSecret !== requiredSecret) {
      return res.status(401).json({ message: 'Unauthorized: Invalid Admin Secret.' });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (author) updateData.author = author;
    if (price) updateData.price = Number(price);
    if (semester) updateData.semester = Number(semester);
    if (course) updateData.course = course;
    
    if (req.file) {
      updateData.imageUrl = '/uploads/' + req.file.filename;
    }

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    res.json({ message: 'Book updated successfully.', book });
  } catch (error) {
    console.error('Error admin updating book:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
