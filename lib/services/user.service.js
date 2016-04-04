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
        .then((existing) => {

            if (existing) {
                return Promise.reject(Boom.conflict('username', { username: candidateUser.username }));
            }
        })
        .then(() => user.save())
        .then(() => user);
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
    return User.findOne({ username: candidateUser.username }).exec()
        .then((existing) => {

            if (existing) {
                return Promise.reject(Boom.conflict('username', { username: candidateUser.username }));
            }
        })
        .then(() => User.findOneAndUpdate({ _id: idUser }, { $set: candidateUser }, { new: true }).exec())
        .then((user) => {

            if (!user) {
                return Promise.reject(Boom.notFound('user.not.found', { idUser }));
            }
            return user;
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
