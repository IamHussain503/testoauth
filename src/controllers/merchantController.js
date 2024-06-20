// src/controllers/merchantController.js
const Merchant = require('../models/Merchant');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');


// exports.loginPage = async (req, res) => {
//     try {
//         const { client_id, redirect_uri, response_type, state } = req.query;

//         res.send(`
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                 <title>Login Page</title>
//                 <!-- Bootstrap CSS -->
//                 <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
//                 <style>
//                     body {
//                         background-color: #f8f9fa;
//                     }
//                     .vertical-center {
//                         min-height: 100vh;
//                         display: flex;
//                         align-items: center;
//                         justify-content: center;
//                     }
//                 </style>
//             </head>
//             <body>
//                 <div class="vertical-center">
//                     <div class="container">
//                         <div class="row justify-content-center">
//                             <div class="col-md-6">
//                                 <div class="card">
//                                     <div class="card-header">Login</div>
//                                     <div class="card-body">
//                                         <form method="POST" action="/api/v1/login">
//                                             <input type="hidden" name="client_id" value="${client_id}" />
//                                             <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
//                                             <input type="hidden" name="response_type" value="${response_type}" />
//                                             <input type="hidden" name="state" value="${state}" />
//                                             <div class="form-group">
//                                                 <label for="email">Email</label>
//                                                 <input type="email" id="email" name="email" class="form-control" required>
//                                             </div>
//                                             <div class="form-group">
//                                                 <label for="password">Password</label>
//                                                 <input type="password" id="password" name="password" class="form-control" required>
//                                             </div>
//                                             <button type="submit" class="btn btn-primary w-100">Login</button>
//                                         </form>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- Bootstrap JS (optional) -->
//                 <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
//             </body>
//             </html>
//         `);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// };

exports.loginPage = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, state } = req.query;

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Login Page</title>
                <!-- Bootstrap CSS -->
                <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    body {
                        background-color: #f8f9fa;
                    }
                    .vertical-center {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>
            </head>
            <body>
                <div class="vertical-center">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-md-6">
                                <div class="card">
                                    <div class="card-header">Login</div>
                                    <div class="card-body">
                                        <form id="loginForm" action="/api/v1/login" method="POST">
                                            <input type="hidden" name="client_id" value="${client_id}" />
                                            <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
                                            <input type="hidden" name="response_type" value="${response_type}" />
                                            <input type="hidden" name="state" value="${state}" />
                                            <div class="form-group">
                                                <label for="email">Email</label>
                                                <input type="email" id="email" name="email" class="form-control" required>
                                            </div>
                                            <div class="form-group">
                                                <label for="password">Password</label>
                                                <input type="password" id="password" name="password" class="form-control" required>
                                            </div>
                                            <button type="submit" class="btn btn-primary w-100">Login</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Bootstrap JS (optional) -->
                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                <!-- Ajax script for login -->
              
            </body>
            </html>
        `);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


exports.login = async (req, res) => {
    console.log('Received request body:', req.body);
    console.log('Received query parameters:', req.query);

    const { email, password, client_id, redirect_uri, response_type, state } = req.body;

    if (!email || !password || !client_id || !redirect_uri || !response_type || !state) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    try {
        // Simulate third-party login API call
        // Replace with actual API call if available
        const response = await axios.post('https://devauth.free.beeceptor.com/v1/login', { email, password });
        const rawData = response.data;

        let data;
        try {
            data = JSON.parse(rawData);
        } catch (jsonParseError) {
            data = {
                success: rawData.includes("'success': true"),
                message: rawData.match(/'message': "(.*?)"/)?.[1],
                merchant_id: rawData.match(/'merchant_id': '(\d+)'/)?.[1],
                merchant_group_id: rawData.match(/'merchant_group_id': "(\d+)"/)?.[1],
                merchant_name: rawData.match(/'merchant_name': "(.*?)"/)?.[1]
            };
        }

        const { success, message, merchant_id, merchant_group_id, merchant_name } = data;

        if (success) {
            let merchant = await Merchant.findOneAndUpdate(
                { merchant_id, client_id },
                {
                    merchant_id,
                    merchant_group_id,
                    merchant_name,
                    client_id,
                    $setOnInsert: { dateCreated: new Date() },
                    $currentDate: { dateModified: true },
                    unique_code: uuidv4()
                },
                { upsert: true, new: true }
            );

            res.json({ success: true, message: "Login successful", code: merchant.unique_code, state });
        } else {
            res.json({ success: false, message });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// exports.login = async (req, res) => {

//     const { email, password } = req.body;
//     const { client_id, state } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ success: false, message: "Missing required parameters" });
//     }

//     try {
//         // Make the POST request
//         const response = await axios.post('https://devauth.free.beeceptor.com/v1/login', { email, password });

//         // Ensure response data is valid JSON
//         const rawData = response.data;

//         // Fix JSON format if necessary
//         let data;
//         try {
//             data = JSON.parse(rawData);
//         } catch (jsonParseError) {
//             // Attempt to manually construct a valid JSON object
//             data = {
//                 success: rawData.includes("'success': true"),
//                 message: rawData.match(/'message': "(.*?)"/)?.[1],
//                 merchant_id: rawData.match(/'merchant_id': '(\d+)'/)?.[1],
//                 merchant_group_id: rawData.match(/'merchant_group_id': "(\d+)"/)?.[1],
//                 merchant_name: rawData.match(/'merchant_name': "(.*?)"/)?.[1]
//             };
//         }

//         // Destructure the parsed JSON object
//         const { success, message, merchant_id, merchant_group_id, merchant_name } = data;

//         if (success) {
//             // Check if merchant already exists
//             let merchant = await Merchant.findOne({ merchant_id, client_id });
//             const unique_code = uuidv4();

//             if (!merchant) {
//                 // Create a new merchant entry
//                 merchant = new Merchant({
//                     merchant_id,
//                     merchant_group_id,
//                     merchant_name,
//                     client_id,
//                     unique_code
//                 });
//             } else {
//                 // Update existing merchant details
//                 merchant.unique_code = unique_code;
//             }

//             // Save the merchant
//             await merchant.save();

//             // Respond with success
//             res.json({ success: true, message: "Login successful", code: unique_code, state });
//         } else {
//             res.json({ success: false, message });
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ success: false, message: "Internal server error" });
//     }
// };


