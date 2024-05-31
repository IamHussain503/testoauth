const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ClientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    client_id: { type: String, required: true, unique: true },
    client_secret: { type: String, required: true, unique: true }
});

ClientSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Client = mongoose.model('Client', ClientSchema);
module.exports = Client;
