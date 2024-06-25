const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const merchantController = require('../controllers/merchantController');
const customEndpointController = require('../controllers/customEndpointController');
const roleCredentialsController = require('../controllers/roleCredentialsController');
const { Request, Response } = require('../models/oauth');
const oauth = require('../models/oauth').oauth;


router.post('/v1/register', clientController.registerClient);
router.get('/v1/authorize', clientController.authorizeClient);

router.get('/v1/login', merchantController.loginPage);
router.post('/v1/login', merchantController.login);
// router.post('/v1/login', (req, res, next) => {
//     const request = new Request(req);
//     const response = new Response(res);
//     oauth.authorize(request, response, {
//         authenticateHandler: {
//             handle: req => {
//                 return { id: req.query.client_id };
//             }
//         }
//     }).then(code => {
//         // console.log('code', code)
//         res.locals.code = code;
//         next();
//     }).catch(err => {
//         res.status(500).json({ message: err.message });
//     });
// }, merchantController.login);


router.post('/v1/token', clientController.generateToken);

router.post('/v1/custom_endpoint', async (req, res, next) => {
    try {
        const request = new Request(req);
        const response = new Response(res);
        const token = await oauth.authenticate(request, response);
        console.log('token', token)
        // Attach user and token info to req object if needed
        req.user = token.user;
        req.token = token;

        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }
}, customEndpointController.customEndpoint);

router.post('/v1/role_credentials', async (req, res, next) => {
    try {
        const request = new Request(req);
        const response = new Response(res);
        const token = await oauth.authenticate(request, response);
        req.clientId = token.client.clientId;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }

}, roleCredentialsController.updateCredentials);

router.post('/v1/merchant_credentials', async (req, res, next) => {
    try {
        const request = new Request(req);
        const response = new Response(res);
        const token = await oauth.authenticate(request, response);
        req.accessToken = token.accessToken;
        next();

    } catch (error) {
        res.status(401).json({ message: 'Unauthorized' });
    }

}, roleCredentialsController.merchantCredentials);


module.exports = router;
