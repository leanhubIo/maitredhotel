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
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

const User = require('../../lib/models/user.model');
const UserService = require('../../lib/services/user.service');

Mongoose.Promise = global.Promise; // Personal choice

/**
 * Connect once for all tests
 */
before(() => Mongoose.connect(`mongodb://localhost/maitredhotel_test_user_service_${Date.now()}`));

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

describe('UserService.save', () => {

    it('should create a new user', { plan: 10 }, () => {

        const candidate = {
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com'
        };
        let idUser;
        return UserService.save(candidate)
            .then((user) => {

                expect(user).to.exist();
                expect(user.creationDate).to.exist();
                expect(user.creationDate).to.be.an.instanceof(Date);
                expect(user.lastUpdate).to.exist();
                expect(user.lastUpdate).to.be.an.instanceof(Date);
                expect(user.lastUpdate - user.creationDate).to.be.below(10);
                expect(new Date() - user.creationDate).to.be.below(5000);

                idUser = user._id;
            })
            .then(() => User.find().exec())
            .then((users) => {

                expect(users).to.be.an.array();
                expect(users).to.have.length(1);
                expect(`${users[0]._id}`).to.equal(`${idUser}`);
            });
    });

    it('should refuse to create a new user with an existing username', { plan: 5 }, () => {

        const candidate = {
            githubid: 'x',
            username: 'u1',
            email: 'u1@u1.com'
        };
        const user = new User(candidate);
        return user.save()
            .then(() => UserService.save(candidate))
            .catch((err) => {

                expect(err).to.exist();
                expect(err.output.statusCode).to.equal(HttpStatus.CONFLICT);
                return Promise.resolve();
            })
            .then(() => User.find().exec())
            .then((users) => {

                expect(users).to.be.an.array();
                expect(users).to.have.length(1);
                expect(`${users[0]._id}`).to.equal(`${user._id}`);
            });
    });

});
