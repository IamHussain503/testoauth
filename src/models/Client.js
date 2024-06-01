const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    client_id: { type: String, required: true, unique: true },
    client_secret: { type: String, required: true },
    redirect_uri: { type: String, required: true }
});

clientSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

const Client = mongoose.model('Client', clientSchema);
module.exports = Client;
