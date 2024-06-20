// src/models/Merchant.js
const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchant_id: { type: String, required: true },
    merchant_group_id: { type: String },
    merchant_name: { type: String, required: true },
    client_id: { type: String, required: true },
    unique_code: { type: String, unique: true }
}, {
    timestamps: { createdAt: 'dateCreated', updatedAt: 'dateModified' }
});

const Merchant = mongoose.model('Merchant', merchantSchema);
module.exports = Merchant;
