const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    token: String    
});

const Tokens = new mongoose.model('tokens', tokenSchema);

module.exports = Tokens;