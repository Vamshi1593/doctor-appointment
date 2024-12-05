const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3002;
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
    qualification: String,
    hospitalName: String,
    address: String
});

const doctorSchema = new mongoose.Schema({
    name: String,
    username: String,
    qualification: String,
    available: Boolean,
    address: String,
    phone: String,
    email: String,
    hospitalName: String
});

const appointmentSchema = new mongoose.Schema({
    doctorUsername: String,
    patientUsername: String,
    appointmentTime: String,
    date: String,
    confirmed: Boolean
});

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

// RESTful API Endpoints
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

app.post('/register', async (req, res) => {
    const { username, password, name, age, gender, role, city, phone, qualification, hospitalName, address } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'Username already exists' });

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        if (role === 'doctor') {
            const newDoctor = new Doctor({ username, name, qualification, available: true, address, phone, hospitalName });
            await newDoctor.save();
        }

        const newUser = new User({ username, password: hashedPassword, name, age, gender, role, city, phone, qualification, hospitalName, address });
        await newUser.save();

        res.json({ message: 'Registration successful', user: newUser });
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.get('/doctors', async (req, res) => {
    try {
        const doctors = await Doctor.find({});
        res.json(doctors);
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.post('/appointments', async (req, res) => {
    const { doctorUsername, patientUsername, appointmentTime, date } = req.body;
    const newAppointment = new Appointment({ doctorUsername, patientUsername, appointmentTime, date, confirmed: false });
    try {
        await newAppointment.save();
        res.json({ message: 'Appointment booked successfully', appointment: newAppointment });
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.get('/appointments/:doctorUsername', async (req, res) => {
    const { doctorUsername } = req.params;
    try {
        const appointments = await Appointment.find({ doctorUsername });
        res.json(appointments);
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.put('/appointments/:id/confirm', async (req, res) => {
    const { id } = req.params;
    try {
        const appointment = await Appointment.findByIdAndUpdate(id, { confirmed: true }, { new: true });
        res.json(appointment);
    } catch (err) {
        return res.status(500).send(err);
    }
});

app.delete('/appointments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await Appointment.findByIdAndDelete(id);
        res.json({ message: 'Appointment cancelled' });
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
