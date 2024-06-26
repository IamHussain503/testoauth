const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const Client = require('./Client');
const Token = require('./Token');
const AuthCode = require('./AuthCode');
const Merchant = require('./Merchant');

const oauth = new OAuth2Server({
    model: {
        getClient: async (clientId, clientSecret) => {
            const query = clientSecret ? { client_id: clientId, client_secret: clientSecret } : { client_id: clientId };
            // console.log(`Querying client with ID: ${clientId} and Secret: ${clientSecret}`);
            const client = await Client.findOne(query);
            // console.log(`getClient - Client ID: ${clientId}, Client Secret: ${clientSecret}, Found: ${client ? 'Yes' : 'No'}`);
            if (!client) return null;
            return {
                id: String(client._id),
                clientId: String(client.client_id),
                clientSecret: String(client.client_secret),
                grants: ['authorization_code', 'refresh_token'],
                redirectUris: [client.redirect_uri]
            };
        },
        saveAuthorizationCode: async (code, client, user) => {
            const authCode = await AuthCode.create({
                code: code.authorizationCode,
                client_id: String(client.clientId),
                user_id: String(user.id),
                expire_time: code.expiresAt,
                redirect_uri: code.redirectUri // Ensure this is stored
            });
            // console.log(`saveAuthorizationCode - code: ${code.authorizationCode}, client: ${client.clientId}, user: ${user.id}`);
            return {
                authorizationCode: authCode.code,
                expiresAt: authCode.expire_time,
                redirectUri: authCode.redirect_uri,
                client: client,
                user: user
            };
        },
        getAuthorizationCode: async (authorizationCode) => {
            const authCode = await AuthCode.findOne({ code: authorizationCode });
            if (!authCode) return null;
            const client = await Client.findOne({ client_id: authCode.client_id });
            // console.log(`getAuthorizationCode - authorizationCode: ${authorizationCode}, authCode: ${JSON.stringify(authCode)}`);
            return {
                authorizationCode: authCode.code,
                expiresAt: authCode.expire_time,
                redirectUri: authCode.redirect_uri,
                client: {
                    id: String(client._id),
                    clientId: String(client.client_id)
                },
                user: {
                    id: String(authCode.user_id)
                }
            };
        },

        revokeAuthorizationCode: async (code) => {
            const result = await AuthCode.deleteOne({ code: code.authorizationCode });
            return result.deletedCount > 0;
        },
        // saveToken: async (token, client, user) => {
        //     console.log('Token:', JSON.stringify(token, null, 2));

        //     // Extract merchant_id from the token object or token attributes
        //     const merchantId = token.merchant_id || token.attributes.merchant_id;
        //     if (!merchantId) {
        //         throw new Error(`Merchant ID not found in token`);
        //     }

        //     const accessToken = await Token.create({
        //         client_id: String(client.clientId),
        //         user_id: String(user.id),
        //         access_token: token.accessToken,
        //         refresh_token: token.refreshToken,
        //         expire_time: token.accessTokenExpiresAt,
        //         merchant_id: merchantId
        //     });

        //     return {
        //         accessToken: accessToken.access_token,
        //         accessTokenExpiresAt: accessToken.expire_time,
        //         refreshToken: accessToken.refresh_token,
        //         refreshTokenExpiresAt: token.refreshTokenExpiresAt,
        //         client: client,
        //         user: { id: user.id }
        //     };
        // },
        saveToken: async (token, client, user) => {
            // console.log('Token:', JSON.stringify(token, null, 2));
            // console.log('Client:', JSON.stringify(client, null, 2));
            console.log('User:', JSON.stringify(user, null, 2));
            // // Check if req.body exists and has merchant_id
            // const merchant = await Merchant.findOne({ code: token.authorizationCode });
            // if (!merchant) {
            //     throw new Error(`Merchant ID not found`);
            // }
            const accessToken = await Token.create({
                client_id: String(client.clientId),
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expire_time: token.accessTokenExpiresAt,
                merchant_id: String(user.id)
            });
            // console.log(`saveToken - accessToken: ${token.accessToken}, client: ${client.clientId}, user: ${user.id}`);
            return {
                accessToken: accessToken.access_token,
                accessTokenExpiresAt: accessToken.expire_time,
                refreshToken: accessToken.refresh_token,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                client: client,
                user: {
                    id: user.id,
                }
            };
        },

        getAccessToken: async (accessToken) => {
            const token = await Token.findOne({ access_token: accessToken });
            if (!token) return null;
            const client = await Client.findOne({ client_id: token.client_id });
            return {
                accessToken: token.access_token,
                accessTokenExpiresAt: token.expire_time,
                client: {
                    id: String(client._id),
                    clientId: String(client.client_id)
                },
                user: {
                    id: String(token.user_id),
                }
            };
        },
        getRefreshToken: async (refreshToken) => {
            console.log('refreshToken', refreshToken)

            const token = await Token.findOne({ refresh_token: refreshToken });
            if (!token) return null;
            const client = await Client.findOne({ client_id: token.client_id });
            return {
                refreshToken: token.refresh_token,
                refreshTokenExpiresAt: null,
                client: {
                    id: String(client._id),
                    clientId: String(client.client_id)
                },
                user: {
                    id: String(token.user_id),
                }
            };
        },
        revokeToken: async (token) => {
            const result = await Token.deleteOne({ refresh_token: token.refreshToken });
            return result.deletedCount > 0;
        }
    },
    accessTokenLifetime: 3600,
    allowBearerTokensInQueryString: true,
    allowEmptyState: true,
    allowExtendedTokenAttributes: true,
});


module.exports = {
    oauth,
    Request,
    Response
};
