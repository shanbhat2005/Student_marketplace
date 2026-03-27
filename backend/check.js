require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const orders = await Order.find().sort({createdAt:-1}).limit(2).populate('seller', 'name').populate('book', 'title');
  console.log('Latest Orders:', JSON.stringify(orders, null, 2));
  
  const books = await Book.find().sort({createdAt:-1}).limit(2);
  console.log('Latest Books:', JSON.stringify(books, null, 2));
  
  process.exit();
});
