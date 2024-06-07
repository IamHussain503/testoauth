// src/controllers/customEndpointController.js
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Client = require('../models/Client');

// exports.customEndpoint = async (req, res) => {
//     try {
//         const { authorization } = req.headers;
//         if (!authorization || !authorization.startsWith('Bearer ')) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         const token = authorization.split(' ')[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const client = await Client.findOne({ client_id: decoded.client_id });

//         if (!client) {
//             return res.status(401).json({ message: 'Unauthorized' });
//         }

//         const response = await axios.post('https://third-party-api.com/endpoint', req.body);
//         res.status(200).json({ success: true, message: 'successful operation', data: response.data });
//     } catch (err) {
//         res.status(500).json({ success: false, message: err.message });
//     }
// };


exports.customEndpoint = async (req, res) => {
    try {
        // Use the token from the authenticated middleware
        const token = req.token;
        console.log('Authenticated token:', token);

        // Forward the request to the third-party API with the Authorization header
        const thirdPartyResponse = await axios.post('https://third-party-api.com/endpoint', req.body, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token.accessToken}`
            }
        });

        // Send success response
        res.status(200).json({ success: true, message: 'successful operation', data: thirdPartyResponse.data });
    } catch (err) {
        console.error('Error in customEndpoint:', err);

        // Handle authentication errors and other errors
        if (err.name === 'UnauthorizedRequestError') {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};
