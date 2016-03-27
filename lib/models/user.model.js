'use strict';
const Mongoose = require('mongoose');

const userSchema = {
    githubid: {
        type: String,
        required: true
    },
    githubclientsecret: {
        type: String
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
        required: true
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
    }
};

module.exports = Mongoose.model('User', userSchema);
