const Client = require('../models/Client');
const { generateTokens } = require('../utils/token');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.updateCredentials = async (req, res) => {
    try {
        const { authorization } = req.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const token = authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const client = await Client.findOne({ client_id: decoded.client_id });

        if (!client) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const client_id = uuidv4();
        const client_secret = uuidv4();

        client.client_id = client_id;
        client.client_secret = client_secret;
        await client.save();

        // Generate new tokens
        const tokens = await generateTokens(client_id);

        res.status(200).json({
            name: client.name,
            client_id: client.client_id,
            client_secret: client.client_secret,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expire_time: tokens.expire_time
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
