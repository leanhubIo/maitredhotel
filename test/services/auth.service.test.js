'use strict';
const HttpStatus = require('http-status-codes'); // list of HTTP status
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
// const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

const User = require('../../lib/models/user.model');
const AuthService = require('../../lib/services/auth.service');

// Mock library
const Proxyquire = require('proxyquire');

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

describe('AuthService.produceToken', () => {

    it('should return a token', { plan: 2 }, () => {

        return AuthService.produceToken()
            .then((token) => {

                expect(token).to.be.a.string();
                expect(token).to.have.length(96);
            });
    });

    it('should fail to return a token', { plan: 2 }, () => {

        const fakeCrypto = {
            randomBytes: function (size, cb) {

                return cb(new Error('error_0'));
            }
        };
        const Service = Proxyquire('../../lib/services/auth.service', { crypto: fakeCrypto });

        return Service.produceToken()
            .catch((err) => {

                expect(err).to.exist();
                expect(err.message).to.equal('error_0');
            });
    });
});

describe('AuthService.assignToken', () => {

    it('should assign a token to a user', { plan: 3 }, () => {

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com'
        });

        let actualToken = '';

        return user.save()
            .then(() => AuthService.assignToken(user._id))
            .then((token) => {

                expect(token.token).to.be.a.string();
                expect(token.token).to.have.length(96);
                actualToken = token.token;
            })
            .then(() => User.findById(user._id).select('token').exec())
            .then((usr) => {

                expect(usr.token).to.equal(actualToken);
            });
    });

    it('should fail to assign a token to a non existing user', { plan: 2 }, () => {

        return AuthService.assignToken(Mongoose.Types.ObjectId())
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});

describe('AuthService.removeToken', () => {

    it('should removeToken a token to a user', { plan: 3 }, () => {

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        return user.save()
            .then(() => AuthService.removeToken(user._id))
            .then((res) => {

                expect(res).to.be.empty();
            })
            .then(() => User.findById(user._id).select('token').exec())
            .then((usr) => {

                expect(usr).to.exist();
                expect(usr.token).to.not.exist();
            });
    });

    it('should fail to removeToken a token to a non existing user', { plan: 2 }, () => {

        return AuthService.removeToken(Mongoose.Types.ObjectId())
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});

describe('AuthService.findByToken', () => {

    it('should find a user based on his token', { plan: 2 }, () => {

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        return user.save()
            .then(() => AuthService.findByToken('a'))
            .then((usr) => {

                expect(usr).to.exist();
                expect(usr.username).to.equal('u1');
            });
    });

    it('should not find any user', { plan: 2 }, () => {

        return AuthService.findByToken('a')
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});

describe('AuthService.validateToken', () => {

    it('should validate a user based on his token', { plan: 5 }, (done) => {

        const user = new User({
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com',
            token: 'a'
        });

        user.save()
            .then(() => {

                AuthService.validateToken('a', (err, auth, usr) => {

                    expect(err).to.not.exist();
                    expect(auth).to.be.true();
                    expect(usr).to.exist();
                    expect(usr.scope).to.have.length(1);
                    expect(usr.scope[0]).to.equal(`user-${user._id}`);
                    done();
                });
            });
    });

    it('should not validate a user based on his token', { plan: 3 }, (done) => {

        AuthService.validateToken('a', (err, auth, usr) => {

            expect(err).to.exist();
            expect(auth).to.be.false();
            expect(usr).to.not.exist();
            done();
        });

    });
});

describe('AuthService.githubHandler', () => {

    it('should login a new user', { plan: 4 }, () => {

        const credentials = {
            token: 'a',
            profile: {
                id: 1,
                username: 'u1',
                displayName: 'uu1',
                email: 'u1@test.fr',
                raw: {
                    avatar_url: 'helo'
                }
            }

        };

        return AuthService.githubHandler(credentials)
            .then((response) => {

                expect(response).to.exist();
                expect(response.token).to.exist();
                return response.token;
            })
            .then((token) => User.findOne({ token }).exec())
            .then((user) => {

                expect(user).to.exist();
                expect(user.username).to.equal('u1');
            });
    });

    it('should login an existing user', { plan: 4 }, () => {

        const credentials = {
            token: 'a',
            profile: {
                id: 1,
                username: 'u1',
                displayName: 'uu1',
                email: 'u1@u1.fr',
                raw: {
                    avatar_url: 'helo'
                }
            }
        };

        const user0 = new User({
            githubid: '1',
            username: 'u1',
            email: 'u1@u1.com'
        });

        return user0.save()
            .then(() => AuthService.githubHandler(credentials))
            .then((response) => {

                expect(response).to.exist();
                expect(response.token).to.exist();
                return response.token;
            })
            .then((token) => User.findOne({ token }).exec())
            .then((user) => {

                expect(user).to.exist();
                expect(user.username).to.equal('u1');
            });
    });
});
