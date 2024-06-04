// src/utils/token.js
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const AuthCode = require('../models/AuthCode');
const Token = require('../models/Token');
const Client = require('../models/Client');
const dotenv = require('dotenv');
const crypto = require('crypto')

dotenv.config();

const generateAuthCode = async (client_id) => {
    const code = uuidv4();
    const expire_time = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await AuthCode.create({ client_id, code, expire_time });
    return code;
};

const generateTokens = async (client_id) => {
    const access_token = jwt.sign({ client_id }, process.env.JWT_SECRET, { expiresIn: "3600s" }); // Expires in 3600 seconds (1 hour)
    const refresh_token = crypto.randomBytes(32).toString('hex');
    const expire_time = Math.floor(Date.now() / 1000) + 3600; // Expiration time in seconds (3600 seconds = 1 hour)
    await Token.create({ client_id, access_token, refresh_token, expire_time });
    return { access_token, refresh_token, expire_time };
};

module.exports = {
    generateAuthCode,
    generateTokens,
};
