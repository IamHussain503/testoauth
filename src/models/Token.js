const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    client_id: { type: String, required: true },
    merchant_id: { type: String, required: true }, // Store merchant ID
    access_token: { type: String, required: true, unique: true },
    refresh_token: { type: String, required: true, unique: true },
    expire_time: { type: Date, required: true }
});

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;
