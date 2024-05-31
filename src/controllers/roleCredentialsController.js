// src/controllers/roleCredentialsController.js
const Client = require('../models/Client');
const { generateTokens } = require('../utils/token');

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

        res.status(200).json({
            name: client.name,
            client_id: client.client_id,
            client_secret: client.client_secret
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
