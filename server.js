// Required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize app
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/healthApp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['patient', 'doctor'] },
  phone: String,
  city: String,
  age: Number,
  sex: String,
  qualification: String,  // Only for doctor
  hospital: String,       // Only for doctor
  address: String         // Only for doctor
});

const User = mongoose.model('User', userSchema);

// JWT secret key
const JWT_SECRET = 'your-secret-key';

// Register route
app.post('/register', async (req, res) => {
  const { name, email, password, role, phone, city, age, sex, qualification, hospital, address } = req.body;

  // Validate required fields
  if (!name || !email || !password || !role || !phone) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
    phone,
    city,
    age,
    sex,
    qualification,
    hospital,
    address
  });

  try {
    await newUser.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred during registration' });
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required' });
  }

  // Find user by email
  const user = await User.findOne({ email: username, role });

  if (!user) {
    return res.status(400).json({ message: `No ${role} found with the provided credentials` });
  }

  // Compare the password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid password' });
  }

  // Generate JWT token
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

  res.json({
    message: 'Login successful',
    token,
    user: {
      username: user.name,
      role: user.role
    }
  });
});

// Server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
