const OAuth2Server = require('oauth2-server');
const Request = OAuth2Server.Request;
const Response = OAuth2Server.Response;
const Client = require('./Client');
const Token = require('./Token');
const AuthCode = require('./AuthCode');

const oauth = new OAuth2Server({
    model: {
        getClient: async (clientId, clientSecret) => {
            const client = await Client.findOne({ client_id: clientId, client_secret: clientSecret });
            if (!client) return null;
            return {
                id: client._id,
                clientId: client.client_id,
                clientSecret: client.client_secret,
                grants: ['authorization_code', 'refresh_token'],
                redirectUris: null
            };
        },
        saveAuthorizationCode: async (code, client, user) => {
            const authCode = await AuthCode.create({
                code: code.authorizationCode,
                client_id: client.clientId,
                user_id: user.id,
                expire_time: code.expiresAt
            });
            return {
                authorizationCode: authCode.code,
                expiresAt: authCode.expire_time,
                redirectUri: code.redirectUri,
                client: client,
                user: user
            };
        },
        getAuthorizationCode: async (authorizationCode) => {
            const authCode = await AuthCode.findOne({ code: authorizationCode });
            if (!authCode) return null;
            const client = await Client.findOne({ client_id: authCode.client_id });
            return {
                code: authCode.code,
                client: {
                    id: client._id,
                    clientId: client.client_id
                },
                expiresAt: authCode.expire_time,
                redirectUri: null,
                user: {
                    id: authCode.user_id
                }
            };
        },
        revokeAuthorizationCode: async (code) => {
            const result = await AuthCode.deleteOne({ code: code.authorizationCode });
            return result.deletedCount > 0;
        },
        saveToken: async (token, client, user) => {
            const accessToken = await Token.create({
                client_id: client.clientId,
                access_token: token.accessToken,
                refresh_token: token.refreshToken,
                expire_time: token.accessTokenExpiresAt
            });
            return {
                accessToken: accessToken.access_token,
                accessTokenExpiresAt: accessToken.expire_time,
                refreshToken: accessToken.refresh_token,
                refreshTokenExpiresAt: token.refreshTokenExpiresAt,
                client: client,
                user: user
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
                    id: client._id,
                    clientId: client.client_id
                },
                user: {
                    id: token.user_id
                }
            };
        },
        getRefreshToken: async (refreshToken) => {
            const token = await Token.findOne({ refresh_token: refreshToken });
            if (!token) return null;
            const client = await Client.findOne({ client_id: token.client_id });
            return {
                refreshToken: token.refresh_token,
                refreshTokenExpiresAt: null,
                client: {
                    id: client._id,
                    clientId: client.client_id
                },
                user: {
                    id: token.user_id
                }
            };
        },
        revokeToken: async (token) => {
            const result = await Token.deleteOne({ refresh_token: token.refreshToken });
            return result.deletedCount > 0;
        }
    }
});

module.exports = {
    oauth,
    Request,
    Response
};
