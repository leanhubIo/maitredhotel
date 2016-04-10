'use strict';
const Bell = require('bell');
const AuthBearer = require('hapi-auth-bearer-token');

const AuthService = require('./lib/services/auth.service');
const Routes = require('./lib').routes;

exports.register = function (server, options, next) {

    if (!options || !options.github){
        return next(new Error('no options provided for github'));
    }

    const ghOptions = options.github;
    ghOptions.scope = ['user:email', 'gist'];
    ghOptions.provider = 'github';

    server.register([Bell, AuthBearer])
        .then(() => {

            server.auth.strategy('github', 'bell', ghOptions);
            server.auth.strategy('bearer', 'bearer-access-token', {
                allowQueryToken: false,
                validateFunc: AuthService.validateToken
            });
            server.auth.default('bearer');
        })
        .then(() => {

            server.route(Routes);
        })
        .then(() => next())
        .catch((err) => next(err));
};

exports.register.attributes = {
    pkg: require('./package.json')
};
