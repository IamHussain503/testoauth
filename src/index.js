const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
// const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function jsonToUrlencoded(req, res, next) {
    if (req.is('application/json')) {
        const urlEncodedBody = new URLSearchParams(req.body).toString();
        req.headers['content-type'] = 'application/x-www-form-urlencoded';
        req.rawBody = urlEncodedBody;
    }
    next();
}

app.use(jsonToUrlencoded);
app.use(express.json());
app.use('/api', routes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
