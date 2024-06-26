const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const routes = require('./routes');
// const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
dotenv.config();

const app = express();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Custom middleware to handle JSON to URL-encoded conversion if needed
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


app.set('view engine', 'ejs');

// Set views directory (assuming 'views' folder in root)
app.set('views', path.join(__dirname, 'views'));

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('err', err)
    console.error('Error connecting to MongoDB:', err.message);

});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
