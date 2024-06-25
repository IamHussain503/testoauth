const Client = require('../models/Client');
const Merchant = require('../models/Merchant');
const Token = require('../models/Token');
const { generateTokens } = require('../utils/token');
const { v4: uuidv4 } = require('uuid');

exports.updateCredentials = async (req, res) => {
    try {
        const clientId = req.clientId; // clientId should be set by middleware
        const client = await Client.findOne({ client_id: clientId });

        if (!client) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const newClientId = uuidv4();
        const newClientSecret = uuidv4();

        client.client_id = newClientId;
        client.client_secret = newClientSecret;
        await client.save();
        const tokens = await generateTokens(newClientId);

        res.status(200).json({
            name: client.name,
            client_id: client.client_id,
            client_secret: client.client_secret,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expire_time: tokens.expire_time
        });

    } catch (err) {
        console.error('Error updating credentials:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.merchantCredentials = async (req, res) => {

    try {
        const accessToken = req.accessToken; // clientId should be set by middleware
        const merchant = await Token.findOne({ access_token: accessToken });

        if (!merchant) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        res.status(200).json(merchant);

    } catch (err) {
        console.error('Error merchant credentials:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};