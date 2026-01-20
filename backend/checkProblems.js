const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DB_CONNECT_STRING;

async function checkProblems() {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to MongoDB');

        const problemCollection = mongoose.connection.collection('problems');
        const count = await problemCollection.countDocuments();
        console.log(`Total Problems in DB: ${count}`);

        if (count > 0) {
            const problems = await problemCollection.find().limit(2).toArray();
            console.log('Sample Problems:', JSON.stringify(problems, null, 2));
        }

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProblems();
