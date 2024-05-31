const mongoose = require('mongoose');

const AuthCodeSchema = new mongoose.Schema({
    client_id: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    expire_time: { type: Date, required: true }
});

const AuthCode = mongoose.model('AuthCode', AuthCodeSchema);
module.exports = AuthCode;
