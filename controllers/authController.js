const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const nodemailer = require('nodemailer');
const Joi = require('joi');

// Register User
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Log the incoming request data
    console.log('Registering user with data:', req.body);

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false,
    });

    console.log('User created successfully:', newUser);

    // Uncomment this when ready to use email verification
    sendVerificationEmail(newUser.email, newUser.id);

    return res.status(201).json({ message: 'User created. Please verify your email.' });

  } catch (error) {
    console.error('Error creating user:', error.message); // Log the error message
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

exports.sendVerificationEmail = (email, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;

  // Use your mail-sending service here (e.g., Nodemailer)
  sendEmail({
    to: email,
    subject: 'Verify your email',
    text: `Click this link to verify your email: ${verificationUrl}`,
  });
};


// Email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(400).json({ message: 'Invalid token or user not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'User already verified' });
    }

    // Mark user as verified
    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

// Login User
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });

  const { error } = schema.validate({ email, password });
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
      return res.status(400).json({ message: 'Please verify your email' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in' });
  }
};
