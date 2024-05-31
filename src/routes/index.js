const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const customEndpointController = require('../controllers/customEndpointController');
const roleCredentialsController = require('../controllers/roleCredentialsController');
const { oauth } = require('../models/oauth');

router.post('/v1/register', clientController.registerClient);
router.get('/v1/authorize', (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    oauth.authorize(request, response, {
        authenticateHandler: {
            handle: req => {
                return { id: req.query.client_id };
            }
        }
    }).then(code => {
        next();
    }).catch(err => {
        res.status(500).json({ message: err.message });
    });
}, clientController.authorizeClient);
router.post('/v1/token', clientController.generateToken);
router.post('/v1/custom_endpoint', (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    oauth.authenticate(request, response).then(token => {
        next();
    }).catch(err => {
        res.status(500).json({ message: err.message });
    });
}, customEndpointController.customEndpoint);
router.post('/v1/role_credentials', (req, res, next) => {
    const request = new Request(req);
    const response = new Response(res);
    oauth.authenticate(request, response).then(token => {
        next();
    }).catch(err => {
        res.status(500).json({ message: err.message });
    });
}, roleCredentialsController.updateCredentials);

module.exports = router;