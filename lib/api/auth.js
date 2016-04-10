'use strict';
const AuthService = require('../services/auth.service');

// { method: ['GET', 'POST'], path: '/login', config: AuthController.login }
module.exports.login = {
    description: 'Sign-in a user in the app',
    tags: ['auth'],
    auth: 'github',
    handler: function (request, reply) {

        request.log(['auth'], `login ${request.auth.credentials.username}`);
        return reply(AuthService.githubHandler(request.auth.credentials));
    }
};

// { method: 'GET', path: '/logout', config: AuthController.logout }
module.exports.logout = {
    description: 'lougout a user',
    tags: ['auth'],
    handler: function (request, reply) {

        request.log(['auth'], `logout ${request.auth.credentials._id}`);
        return reply(AuthService.removeToken(request.auth.credentials._id));
    }
};

