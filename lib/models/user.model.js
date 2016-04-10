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
    avatar: String,
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
    displayName: {
        type: String
    },
    email: {
        type: String,
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
        select: false,
        unique: true
    }, // temporary
    tokenCreation: Date
});

module.exports = Mongoose.model('User', userSchema);
