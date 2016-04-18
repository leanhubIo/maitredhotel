'use strict';
const User = require('../models/user.model');
const Boom = require('boom');

const defaultServer = {
    log: console.log.bind({}, new Date(), 'USER: ')
};

/**
 * save anew user if no conflict occurs
 * @param candidateUser
 * @returns {Promise.<*>}
 */
module.exports.save = function (candidateUser, server) {

    server = server || defaultServer;

    const user = new User(candidateUser);
    return User.findOne({ username: candidateUser.username }).exec()
        .then(() => user.save())
        .then(() => {

            server.log(['user', 'create'], `user.created: ${user._id}`);
            return user;
        })
        .catch((err) => {

            server.log(['user', 'create'], `user.not.created: ${err}`);
            return Promise.reject(Boom.conflict(err.errmsg, { username: candidateUser.username }));
        });
};

/**
 * return the public profile of an existing user
 * @param idUser
 * @returns {Promise.<TResult>}
 */
module.exports.read = function (idUser, server) {

    server = server || defaultServer;

    return User.findById(idUser).exec()
        .then((user) => {

            if (!user) {
                server.log(['user', 'read'], `user.not.found: ${idUser}`);
                return Promise.reject(Boom.notFound('user.not.found', { idUser }));
            }
            server.log(['user', 'read'], `user.found: ${idUser}`);
            return user;
        });
};

/**
 * updates an existing user
 * @param idUser
 * @param candidateUser
 * @returns {Promise.<TResult>}
 */
module.exports.update = function (idUser, candidateUser, server) {

    server = server || defaultServer;

    candidateUser.lastUpdate = new Date();
    return User.findOneAndUpdate({ _id: idUser }, { $set: candidateUser }, { new: true }).exec()
        .then((user) => {

            if (!user) {
                server.log(['user', 'update'], `user.not.found: ${idUser}`);
                return Promise.reject(Boom.notFound('user.not.found', { idUser }));
            }
            server.log(['user', 'update'], `user.updated: ${idUser}`);
            return user;
        })
        .catch((err) => {

            if (err.isBoom) {
                return Promise.reject(err);
            }
            server.log(['user', 'update'], `user.not.updated: ${err}`);
            return Promise.reject(Boom.conflict(err.errmsg, { username: candidateUser.username }));
        });
};

/**
 * get a userId from it username
 * @param username
 * @returns {Promise.<TResult>}
 */
module.exports.translate = function (username, server) {

    server = server || defaultServer;

    return User.findOne({ username: username }).exec()
        .then((user) => {

            if (!user) {
                server.log(['user', 'translate'], `user.not.found: ${username}`);
                return Promise.reject(Boom.notFound('user.not.found', { username }));
            }

            server.log(['user', 'read'], `user.found: ${username}`);
            return user;
        });
};
