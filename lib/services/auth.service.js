'use strict';
// TODO: all errors in enum
// TODO: Better: token as keys in redis
const Crypto = require('crypto');
const Boom = require('boom');
const User = require('../models/user.model');
const UserService = require('./user.service');

const defaultServer = {
    log: console.log.bind({}, new Date(), 'AUTH: ')
};

/**
 * Size of the token
 * @type {number}
 */
const SIZE_TOKEN = 48;

/**
 * Generates a random token of size SIZE_TOKEN
 * @type {exports.produceToken}
 */
const produceToken = module.exports.produceToken = function () {

    return new Promise((resolve, reject) => {

        Crypto.randomBytes(SIZE_TOKEN, (err, buffer) => {

            if (err) {
                return reject(err);
            }
            return resolve(buffer.toString('hex'));
        });
    });
};

/**
 * Assign a random token to user
 * @param userId
 * @returns {Promise.<{token: *}>}
 */
const assignToken = module.exports.assignToken = function (userId, server) {

    server = server || defaultServer;

    return User.findById(userId).exec()
        .then((user) => {

            if (!user) {
                server.log(['user', 'login'], `user.not.found: ${userId}`);
                return Promise.reject(Boom.notFound('user', { userId }));
            }

            return Promise.all([user, produceToken()]);
        })
        .then((result) => {

            const user = result[0];
            const token = result[1];
            user.token = token;
            user.tokenCreation = new Date();
            return Promise.all([token, user.save()]);
        })
        .then((result) => {

            server.log(['user', 'login'], `user.login.token: ${userId}`);
            return { token: result[0] };
        });
};

/**
 * remove the token of a user
 * @param userId
 * @returns {Promise.<TResult>}
 */
module.exports.removeToken = function (userId, server) {

    server = server || defaultServer;

    return User.findOneAndUpdate({ _id: userId }, { $unset: { token: 1, tokenCreation: 1 } }, { new: true }).exec()
        .then((user) => {

            if (!user) {
                server.log(['user', 'logout'], `fail.logout: ${userId}`);
                return Promise.reject(Boom.notFound('user', { userId }));
            }
            server.log(['user', 'logout'], `logout: ${userId}`);
            return {};
        });
};

const getFindByToken = function (server) {

    return function (candidateToken) {

        return User.findOne({ token: candidateToken }).exec()
            .then((user) => {

                if (!user) {
                    server.log(['auth', 'token'], `no.such.token: ${candidateToken}`);
                    return Promise.reject(Boom.notFound('no.such.token'));
                }

                return user;
            });
    };
};

const getValidateToken = module.exports.getValidateToken = function (server) {

    return function (token, callback) {

        return getFindByToken(server)(token)
            .then((user) => {

                // decorate the request with the personal scope of the user
                user.scope = [`user-${user._id}`];
                return callback(null, true, user);
            })
            .catch((err) => callback(err, false));
    };
};

module.exports.findByToken = getFindByToken(defaultServer);

module.exports.validateToken = getValidateToken(defaultServer);

module.exports.githubHandler = function (credentials, server) {

    server = server || defaultServer;

    return User.findOne({ githubid: `${credentials.profile.id}` }).exec()
        .then((user) => {

            const candidate = {
                githubid: `${credentials.profile.id}`,
                githubToken: credentials.token,
                username: credentials.profile.username,
                email: credentials.profile.email
            };

            if (!user) {
                server.log(['user', 'login'], `create.user: ${candidate.username}`);
                return UserService.save(candidate, server);
            }

            delete candidate.githubid;
            delete candidate.username;

            server.log(['user', 'login'], `login.user: ${candidate.username}`);
            return UserService.update(user._id, candidate);
        })
        .then((user) => assignToken(user._id, server));
};
