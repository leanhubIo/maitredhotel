'use strict';
const Path = require('path');
const Bell = require('bell');
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

describe('Plugin', () => {

    it('should be instanciated in the server', { plan: 1 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientId: 'id',
                clientSecret: 'secret'
            }
        };

        return getServer(getManifest(options))
            .then((server) => {

                expect(server).to.exist();
            });
    });

    it('should not be instanciated in the server', { plan: 1 }, () => {

        const options = {};

        return getServer(getManifest(options))
            .catch((err) => {

                expect(err).to.exist();
            });
    });

    it('should not be instanciated in the server', { plan: 1 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientSecret: 'secret'
            }
        };

        return getServer(getManifest(options))
            .catch((err) => {

                expect(err).to.exist();
            });
    });
});

describe('Auth.login', () => {

    it('should auth a user from a simulated github', { plan: 3 }, () => {

        const options = {
            github: {
                password: 'arqewhrgewhjrgewlkjbhkljhgrlkjrghelkj',
                clientId: 'id',
                clientSecret: 'secret'
            }
        };

        const injection = { method: 'GET', url: '/login' };

        const credentials = {
            token: 'a',
            profile: {
                id: 1,
                username: 'u12',
                displayName: 'uu1',
                email: 'u1@u1.com2',
                raw: {
                    avatar_url: 'helo'
                }
            }
        };

        Bell.simulate((request, next) => next(null, credentials));

        return getServer(getManifest(options))
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
            })
            .then(() => User.find().exec())
            .then((users) => {

                expect(users).to.have.length(1);
                expect(users[0].username).to.equal('u12');
            })
            .then(() => Bell.simulate(false));
    });
});

describe('Auth.logout', () => {

    it('should logout a user', { plan: 2 }, () => {

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
            url: '/logout',
            headers: { authorization: `Bearer ${user.token}` } };

        return user.save()
            .then(() => getServer(getManifest(options)))
            .then((server) => server.inject(injection))
            .then((response) => {

                expect(response.statusCode).to.equal(HttpStatus.OK);
            })
            .then(() => User.findById(user._id).select('+token').exec())
            .then((usr) => {

                expect(usr.token).to.not.exist();
            });
    });
});
