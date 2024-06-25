const { default: axios } = require('axios');
const { Request, Response } = require('../models/oauth');
const oauth = require('../models/oauth').oauth;
const Merchant = require('../models/Merchant');

const generateRandom8DigitNumber = () => {
    return Math.floor(10000000 + Math.random() * 90000000);
};
const generateFakeMerchantName = () => {
    const merchantNames = [
        "Crazy Merchant 1",
        "Awesome Store",
        "Happy Shop",
        "Super Deals",
        "Fantastic Goods"
    ];
    const randomIndex = Math.floor(Math.random() * merchantNames.length);
    return merchantNames[randomIndex];
};
const mockAuthentication = async (email, password) => {

    // Simulate API response based on hardcoded credentials
    if (email && password) {
        return {
            success: true,
            message: "Login successful",
            merchant_id: generateRandom8DigitNumber(),
            merchant_group_id: generateRandom8DigitNumber(),
            merchant_name: generateFakeMerchantName()
        };
    } else {
        return {
            success: false,
            message: "Invalid credentials"
        };
    }
};


exports.login = async (req, res) => {
    const { email, password, client_id, redirect_uri, response_type, state, scope } = req.body;

    if (!email || !password || !client_id || !redirect_uri || !response_type || !state || !scope) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    try {

        const data = await mockAuthentication(email, password);

        const { success, message, merchant_id, merchant_group_id, merchant_name } = data;

        if (!success) {
            return res.status(401).json({ success: false, message });
        }

        if (!merchant_id) {
            return res.status(500).json({ success: false, message: "Failed to retrieve merchant_id" });
        }
        // Create OAuth request and response
        const oauthRequest = new Request(req);
        const oauthResponse = new Response(res);

        // Generate authorization code
        const code = await oauth.authorize(oauthRequest, oauthResponse, {
            authenticateHandler: {
                handle: () => {
                    return { id: merchant_id, client_id }; // Include both merchant_id and client_id
                }
            }
        });

        if (!code) {
            return res.status(500).json({ success: false, message: "Failed to generate authorization code" });
        }

        let merchant = await Merchant.findOne({ client_id, merchant_id });
        if (merchant) {
            // Document exists, update it
            merchant = await Merchant.findOneAndUpdate(
                { client_id, merchant_id },
                {
                    merchant_id,
                    merchant_group_id,
                    merchant_name,
                    code: code.authorizationCode,
                    expires_at: code.expiresAt,
                    $currentDate: { dateModified: true }
                },
                { new: true }
            );
        } else {
            // Document doesn't exist, create a new one
            merchant = await Merchant.create({
                merchant_id,
                merchant_group_id,
                merchant_name,
                client_id,
                code: code.authorizationCode,
                expires_at: code.expiresAt
            });
        }

        // Respond with the authorization code and other details
        res.json({ success: true, message: "Login successful", code: merchant.code, state, scope });

        // Respond with the authorization code and other details
        // res.json({ success: true, message: "Login successful", code: code.authorizationCode, state, scope });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};



exports.loginPage = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, state, scope } = req.query;
        res.render('login', {
            client_id,
            redirect_uri,
            response_type,
            state,
            scope
        });

    } catch (err) {
        // Send the actual error message back
        res.status(500).json({ message: err.message });
    }
};



