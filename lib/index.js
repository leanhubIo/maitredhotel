'use strict';
const AuthController = require('./api/auth');
const UserController = require('./api/user');

module.exports.routes = [
    // auth
    { method: ['GET', 'POST'], path: '/login', config: AuthController.login },
    { method: 'GET', path: '/logout', config: AuthController.logout },

    { method: 'GET', path: '/users/me', config: UserController.me },
    { method: 'GET', path: '/users/translate/{username}', config: UserController.translate },
    { method: 'GET', path: '/users/{userId}', config: UserController.read }
];

