// src/controllers/customEndpointController.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

exports.customEndpoint = async (req, res) => {
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

        const response = await axios.post('https://third-party-api.com/endpoint', req.body);
        res.status(200).json({ success: true, message: 'successful operation', data: response.data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
