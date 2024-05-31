const Client = require('../models/Client');
const { hashPassword } = require('../utils/hash');
const { oauth, Request, Response } = require('../models/oauth');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

exports.registerClient = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = await hashPassword(password);
        const client_id = uuidv4();
        const client_secret = uuidv4();

        const client = await Client.create({
            name,
            email,
            password: hashedPassword,
            client_id,
            client_secret
        });

        res.status(201).json({
            token: jwt.sign({ client_id }, process.env.JWT_SECRET),
            name: client.name,
            client_id: client.client_id,
            client_secret: client.client_secret
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.authorizeClient = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, scope } = req.query;
        if (response_type !== 'code') {
            return res.status(400).json({ message: 'Invalid response_type' });
        }

        const client = await Client.findOne({ client_id });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const request = new Request(req);
        const response = new Response(res);
        oauth.authorize(request, response).then((authorizationCode) => {
            res.redirect(`${redirect_uri}?code=${authorizationCode.authorizationCode}&scope=${scope}`);
        }).catch((err) => {
            res.status(500).json({ message: err.message });
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.generateToken = async (req, res) => {
    const request = new Request(req);
    const response = new Response(res);

    oauth.token(request, response).then((token) => {
        res.status(200).json(token);
    }).catch((err) => {
        res.status(500).json({ message: err.message });
    });
};
