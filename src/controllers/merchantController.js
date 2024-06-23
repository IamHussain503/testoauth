const { default: axios } = require('axios');
const Merchant = require('../models/Merchant');

exports.login = async (req, res) => {
    const code = res.locals.code.authorizationCode
    const { email, password, client_id, redirect_uri, response_type, state, scope } = req.body;


    if (!email || !password || !client_id || !redirect_uri || !response_type || !state || !scope) {
        return res.status(400).json({ success: false, message: "Missing required parameters" });
    }

    try {
        const response = await axios.post('https://oauth-test.free.beeceptor.com/login', { email, password });
        const rawData = response.data;
        // console.log('rawData', rawData)
        let data;
        try {
            data = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
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

            const merchant = await Merchant.findOneAndUpdate(
                { merchant_id, client_id },
                {
                    merchant_id,
                    merchant_group_id,
                    merchant_name,
                    client_id,
                    $currentDate: { dateModified: true },
                    code: code

                },
                { upsert: true, new: true }
            );

            res.json({ success: true, message: "Login successful", code: merchant.code, state, scope });
        } else {
            res.json({ success: false, message });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


exports.loginPage = async (req, res) => {
    try {
        const { client_id, redirect_uri, response_type, state, scope } = req.query;

        res.send(`
           <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Page</title>
    <!-- jQuery (required by Bootstrap) -->
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <!-- Bootstrap JS -->
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
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
                            <form id="loginForm">
                                <input type="hidden" name="client_id" value="${client_id}" />
                                <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
                                <input type="hidden" name="response_type" value="${response_type}" />
                                <input type="hidden" name="state" value="${state}" />
                                <input type="hidden" name="scope" value="${scope}" />
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

    <script>
        document.getElementById('loginForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);

            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            console.log("data", data);

            try {
                const response = await fetch('/api/v1/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                console.log("result", result);

                if (result.success) {
                    const { code, state ,scope } = result;
                     alert(result.message)
                      window.location.href = \`\${data?.redirect_uri}?code=\${code}&state=\${state}\&scope=\${scope}\`;
                } else {
                    alert(result.message);
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Failed to login. Please try again.');
            }
        });
    </script>
</body>
</html>
        `);
    } catch (err) {
        // Send the actual error message back
        res.status(500).json({ message: err.message });
    }
};



