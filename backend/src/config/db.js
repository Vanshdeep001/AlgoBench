const mongoose = require('mongoose');

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
});
mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING);
}

module.exports = main;


