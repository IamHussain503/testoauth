const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
    merchant_id: { type: String, required: true },
    merchant_group_id: { type: String },
    merchant_name: { type: String, required: true },
    client_id: { type: String, required: true },
    code: { type: String, unique: true },
    expires_at: { type: Date, required: true },
    // email: { type: String } // Ensure email is included in the schema
}, {
    timestamps: { createdAt: 'dateCreated', updatedAt: 'dateModified' }
});
// merchantSchema.index({ merchant_id: 1, client_id: 1 }, { unique: true });

// Create unique sparse index for the email field
merchantSchema.index({ email: 1 }, { unique: true, sparse: true });

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
