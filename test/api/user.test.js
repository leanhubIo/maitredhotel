'use strict';
const Path = require('path');
const HttpStatus = require('http-status-codes'); // list of HTTP status
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();
const Glue = require('glue');

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
// const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

const User = require('../../lib/models/user.model');

Mongoose.Promise = global.Promise; // Personal choice

/**
 * Connect once for all tests
 */
before(() => Mongoose.connect(`mongodb://localhost/maitredhotel_test_auth_service_${Date.now()}`));

/**
 * Disconnect after all tests
 */
after(() => Mongoose.disconnect());

/**
 * Get a clean db for each test
 */
afterEach((done) => {

    Mongoose.connection.db.dropDatabase();
    done();
});

const getManifest = function (options) {

    return {
        server: {},
        connections: [
            {
                port: 3000
            }
        ],
        registrations: [
            {
                plugin: {
                    register: './',
                    options: options
                }
            }
        ]
    };
};

const servOptions = { relativeTo: Path.join(__dirname, '../../') };
const getServer = (manifest) => Glue.compose(manifest, servOptions);

describe('User API', () => {

    it('should read the logged-in user', { plan: 3 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientId: 'id',
                clientSecret: 'secret'
            }
        };

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        const injection = {
            method: 'GET',
            url: '/users/me',
            headers: { authorization: `Bearer ${user.token}` } };

        return user.save()
            .then(() => getServer(getManifest(options)))
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload.username).to.equal('u1');
                expect(`${payload._id}`).to.equal(`${user._id}`);
            });
    });

    it('should translate a user', { plan: 3 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientId: 'id',
                clientSecret: 'secret'
            }
        };

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        const injection = {
            method: 'GET',
            url: `/users/translate/${user.username}`
        };

        return user.save()
            .then(() => getServer(getManifest(options)))
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload.username).to.equal('u1');
                expect(`${payload._id}`).to.equal(`${user._id}`);
            });
    });

    it('should read a user', { plan: 3 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientId: 'id',
                clientSecret: 'secret'
            }
        };

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        const injection = {
            method: 'GET',
            url: `/users/${user._id}`
        };

        return user.save()
            .then(() => getServer(getManifest(options)))
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
                return JSON.parse(response.payload);
            })
            .then((payload) => {

                expect(payload.username).to.equal('u1');
                expect(`${payload._id}`).to.equal(`${user._id}`);
            });
    });

});

