'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const userSchema = Schema({
    githubid: {
        type: String,
        required: true,
        select: false,
        index: true
    },
    githubToken: {
        type: String,
        select: false
    },
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    email: {
        type: String,
        select: false
    },
    creationDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    lastUpdate: {
        type: Date,
        default: Date.now,
        required: true
    },
    token: {
        type: String,
        select: false,
        unique: true
    }, // temporary
    tokenCreation: Date
});

const User = module.exports = Mongoose.model('User', userSchema);

module.exports.ensureCustomIndexes = function () {

    return Mongoose.connection.collections[User.collection.name].createIndex({ username: 1 }, { unique: true })
        .then(() => Mongoose.connection.collections[User.collection.name].createIndex({ token: 1 }, { unique: true, sparse: true }));
};

