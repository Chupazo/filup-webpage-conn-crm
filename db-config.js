const mongoose = require('mongoose');

function connectDB() {
    const dbUri = process.env.MONGO_URI || '';    
    mongoose.connect(dbUri).catch(err => {throw err});
} 

module.exports = connectDB;
