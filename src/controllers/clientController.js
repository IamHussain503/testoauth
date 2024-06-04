const Client = require('../models/Client');
const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const { oauth } = require('../models/oauth');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { hashPassword } = require('../utils/hash');

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
            redirect_uri: client.redirect_uri
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.authorizeClient = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, scope, state } = req.query;
        if (response_type !== 'code') {
            return res.status(400).json({ message: 'Invalid response_type' });
        }

        const client = await Client.findOne({ client_id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const authorizationCode = res.locals.code.authorizationCode;
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.append('code', authorizationCode);
        redirectUrl.searchParams.append('scope', scope);
        if (state) {
            redirectUrl.searchParams.append('state', state);
        }

        res.redirect(redirectUrl.toString());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// exports.authorizeClient = async (req, res) => {
//     try {
//         const { client_id, redirect_uri, response_type, scope, state } = req.query;
//         if (response_type !== 'code') {
//             return res.status(400).json({ message: 'Invalid response_type' });
//         }

//         const client = await Client.findOne({ client_id });
//         if (!client) {
//             return res.status(404).json({ message: 'Client not found' });
//         }

//         const request = new Request(req);
//         const response = new Response(res);

//         oauth.authorize(request, response, {
//             authenticateHandler: {
//                 handle: req => {
//                     return { id: client_id }; // Simulate client authentication
//                 }
//             }
//         })
//             .then((authorizationCode) => {
//                 const redirectUrl = new URL(redirect_uri);
//                 redirectUrl.searchParams.append('code', authorizationCode.authorizationCode);
//                 redirectUrl.searchParams.append('scope', scope);
//                 if (state) {
//                     redirectUrl.searchParams.append('state', state);
//                 }

//                 res.redirect(redirectUrl.toString());
//             })
//             .catch((err) => {
//                 console.error('Authorization error:', err);
//                 res.status(500).json({ message: err.message });
//             });
//     } catch (err) {
//         console.error('Server error:', err);
//         res.status(500).json({ message: err.message });
//     }
// };



exports.generateToken = async (req, res) => {
    try {
        const request = new Request(req);
        const response = new Response(res);
        oauth.token(request, response).then((token) => {
            res.status(200).json(token);
        }).catch((err) => {
            console.error('Token generation error:', err);
            res.status(500).json({ message: err.message });
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ message: err.message });
    }
};