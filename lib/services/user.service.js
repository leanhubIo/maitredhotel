'use strict';
const User = require('../models/user.model');
const Boom = require('boom');

/**
 * save anew user if no conflict occurs
 * @param candidateUser
 * @returns {Promise.<*>}
 */
module.exports.save = function (candidateUser) {

    const user = new User(candidateUser);
    return User.findOne({ username: candidateUser.username }).exec()
        .then(() => user.save())
        .then(() => user)
        .catch((err) => {

            return Promise.reject(Boom.conflict(err.errmsg, { username: candidateUser.username }));
        });
};

/**
 * return the public profile of an existing user
 * @param idUser
 * @returns {Promise.<TResult>}
 */
module.exports.read = function (idUser) {

    return User.findById(idUser).exec()
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('user.not.found', { idUser }));
            }
            return user;
        });
};

/**
 * updates an existing user
 * @param idUser
 * @param candidateUser
 * @returns {Promise.<TResult>}
 */
module.exports.update = function (idUser, candidateUser) {

    candidateUser.lastUpdate = new Date();
    return User.findOneAndUpdate({ _id: idUser }, { $set: candidateUser }, { new: true }).exec()
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('user.not.found', { idUser }));
            }
            return user;
        })
        .catch((err) => {

            if (err.isBoom) {
                return Promise.reject(err);
            }
            return Promise.reject(Boom.conflict(err.errmsg, { username: candidateUser.username }));
        });
};

/**
 * get a userId from it username
 * @param username
 * @returns {Promise.<TResult>}
 */
module.exports.translate = function (username) {

    return User.findOne({ username: username }).exec()
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('user.not.found', { username }));
            }
            return user;
        });
};
