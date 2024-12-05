const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10; // Number of rounds for bcrypt hashing

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/doctor_appointment');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Define Mongoose Schemas and Models
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    name: String,
    age: Number,
    gender: String,
    city: String,
    phone: String,
    email: String,
    qualification: String,
    hospitalName: String,
    address: String
});

const appointmentSchema = new mongoose.Schema({
    doctorUsername: String,
    patientUsername: String,
    appointmentDate: Date,
    details: String
});

const User = mongoose.model('User', userSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// Registration Endpoint
app.post('/register', async (req, res) => {
    const { username, password, name, age, gender, role, city, phone, email, qualification, hospitalName, address } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ username, password: hashedPassword, name, age, gender, role, city, phone, email, qualification, hospitalName, address });
        await newUser.save();

        res.json({ message: 'Registration successful', user: newUser });
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const user = await User.findOne({ username, role });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

        res.json({ message: 'Login successful', user });
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Fetch Doctor Details Endpoint
app.get('/doctors', async (req, res) => {
    try {
        const doctors = await User.find({ role: 'doctor' }, '-password'); // Exclude password from response
        res.json(doctors);
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Book Appointment Endpoint
app.post('/appointments', async (req, res) => {
    const { doctorUsername, patientUsername, appointmentDate, details } = req.body;
    try {
        const newAppointment = new Appointment({ doctorUsername, patientUsername, appointmentDate, details });
        await newAppointment.save();

        res.json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Fetch Appointments for a Doctor
app.get('/appointments/:doctorUsername', async (req, res) => {
    const { doctorUsername } = req.params;
    try {
        const appointments = await Appointment.find({ doctorUsername });
        res.json(appointments);
    } catch (err) {
        return res.status(500).send(err);
    }
});

// Serve index.html for root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
