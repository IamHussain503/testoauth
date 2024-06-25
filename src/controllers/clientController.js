const Client = require('../models/Client');
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const { oauth } = require('../models/oauth');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../utils/hash');
const Merchant = require('../models/Merchant');

exports.registerClient = async (req, res) => {
    try {
        const { name, email, password, redirect_uri } = req.body;
        const hashedPassword = await hashPassword(password);
        const client_id = uuidv4();
        const client_secret = uuidv4();

        const client = await Client.create({
            name,
            email,
            password: hashedPassword,
            client_id,
            client_secret,
            redirect_uri
        });

        res.status(201).json({
            token: jwt.sign({ client_id }, process.env.JWT_SECRET, { expiresIn: "3600s" }),
            name: client.name,
            client_id: client.client_id,
            client_secret: client.client_secret,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// src/controllers/clientController.js
// exports.authorizeClient = async (req, res) => {
//     try {
//         const { client_id, redirect_uri, response_type, scope, state } = req.query;
//         // console.log('response_type', response_type)

//         if (response_type !== 'code') {
//             return res.status(400).json({ message: 'Invalid response_type' });
//         }

//         const client = await Client.findOne({ client_id });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         res.redirect(`/api/v1/login?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}&state=${state}`);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };
exports.authorizeClient = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, state, scope } = req.query;

        if (response_type !== 'code') {
            return res.status(400).json({ message: 'Invalid response_type' });
        }

        const client = await Client.findOne({ client_id });

        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.redirect(`/api/v1/login?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=${response_type}&state=${state}&scope=${scope}`);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.generateToken = async (req, res) => {

    try {
        const request = new Request(req);
        const response = new Response(res);

        oauth.token(request, response).then(async (token) => {
            const merchantId = req.body.merchant_id;

            const expire_time = Math.floor(token.accessTokenExpiresAt.getTime() / 1000); // UNIX timestamp in seconds
            const formattedResponse = {
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expire_time: expire_time,
                id: token.client.id,
                merchant_id: merchantId

            };
            res.status(200).json(formattedResponse);
        }).catch((err) => {
            console.error('Token generation error:', err);
            res.status(500).json({ message: err.message });
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: err.message });
    }
};

