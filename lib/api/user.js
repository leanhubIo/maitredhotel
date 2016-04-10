'use strict';
const Joi = require('joi');
const UserService = require('../services/user.service');

// { method: 'GET', path: '/users/me', config: UserController.me },
module.exports.me = {
    description: 'return the current user',
    tags: ['user'],
    handler: function (request, reply) {

        // TODO: private service
        const userId = request.auth.credentials._id;
        request.log(['user', 'read'], `read ${userId}`);
        return reply(UserService.read(userId));
    }
};

// { method: 'GET', path: '/users/translate/{username}', config: UserController.translate },
module.exports.translate = {
    description: 'gives userId from userName',
    tags: ['user'],
    auth: false,
    handler: function (request, reply) {

        const username = request.params.username;
        request.log(['user', 'translate'], `translate ${username }`);
        return reply(UserService.translate(username));
    }
};

// { method: 'GET', path: '/users/{userId}', config: UserController.read },

module.exports.read = {
    description: 'query a user',
    tags: ['user'],
    validate: {
        params: {
            userId: Joi.string().regex(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i) // mongo id object, todo: external module
        }
    },
    auth: false,
    handler: function (request, reply) {

        // TODO: private service
        const userId = request.params.userId;
        request.log(['user', 'read'], `read ${userId}`);
        return reply(UserService.read(userId));
    }
};
