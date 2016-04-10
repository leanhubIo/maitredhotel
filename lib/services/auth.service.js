'use strict';
// TODO: all errors in enum
// TODO: Better: token as keys in redis
const Crypto = require('crypto');
const Boom = require('boom');
const User = require('../models/user.model');
const UserService = require('./user.service');

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
const assignToken = module.exports.assignToken = function (userId) {

    return User.findById(userId).exec()
        .then((user) => {

            if (!user) {
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
        .then((result) => ({ token: result[0] }));
};

/**
 * remove the token of a user
 * @param userId
 * @returns {Promise.<TResult>}
 */
module.exports.removeToken = function (userId) {

    return User.findOneAndUpdate({ _id: userId }, { $unset: { token: 1, tokenCreation: 1 } }, { new: true }).exec()
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('user', { userId }));
            }
            return {};
        });
};

const findByToken = module.exports.findByToken = function (candidateToken) {

    return User.findOne({ token: candidateToken }).exec()
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('no.such.token'));
            }

            return user;
        });
};

module.exports.validateToken = function (token, callback) {

    return findByToken(token)
        .then((user) => {

            // decorate the request with the personal scope of the user
            user.scope = [`user-${user._id}`];
            return callback(null, true, user);
        })
        .catch((err) => callback(err, false));
};

module.exports.githubHandler = function (credentials) {

    return User.findOne({ githubid: `${credentials.profile.id}` }).exec()
        .then((user) => {

            // TODO: use this opportunity to update the user from his gh profile
            if (!user) {
                const candidate = {
                    githubid: `${credentials.profile.id}`,
                    avatar: credentials.profile.raw.avatar_url, // TODO: gravatar
                    githubToken: credentials.token,
                    username: credentials.profile.username,
                    displayName: credentials.profile.displayName,
                    email: credentials.profile.email,
                    description: credentials.profile.raw.bio,
                    website: credentials.profile.raw.blog
                };
                return UserService.save(candidate);
            }

            return user;
        })
        .then((user) => assignToken(user._id));
};
