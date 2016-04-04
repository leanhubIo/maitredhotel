'use strict';
const Mongoose = require('mongoose');

const userSchema = {
    githubid: {
        type: String,
        required: true,
        select: false
    },
    githubclientsecret: {
        type: String,
        select: false
    },
    username: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    displayName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        select: false
    },
    description: {
        type: String
    },
    website: {
        type: String
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
        select: false
    }, // temporary
    tokenCreation: Date
};

module.exports = Mongoose.model('User', userSchema);
