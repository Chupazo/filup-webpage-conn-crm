const mongoose = require('mongoose');

function connectDB() {
    const dbUri = process.env.MONGO_URI || '';
    mongoose.connect(dbUri).then(() => {console.log('Conectado a base de datos')},
    err => {throw err});
} 

module.exports = connectDB;
