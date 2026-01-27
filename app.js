const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const fileupload = require('express-fileupload');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const auth = require('./routes/auth');
const students = require('./routes/students');
const jobs = require('./routes/jobs');
const errorHandler = require('./middleware/error');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// File uploading
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api/v1/auth', auth);
console.log("Auth mounted");
app.use('/api/v1/students', students);
app.use('/api/v1/jobs', jobs);

// Basic route
app.get('/', (req, res) => {
    res.send('PDMS API is running...');
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found - ${req.originalUrl}`
    });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    // server.close(() => process.exit(1));
});
