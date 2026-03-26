require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

console.log(`Connecting to Gmail as ${process.env.EMAIL_USER}...`);

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // Send to yourself
  subject: 'Test Email from BCA Marketplace',
  text: 'If you see this, Nodemailer is working!'
})
.then(info => console.log('SUCCESS: Email sent!', info.response))
.catch(err => console.error('ERROR: Failed to send email.', err.message));
