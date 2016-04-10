'use strict';
const Bell = require('bell');

exports.register = function (server, options, next) {

    if (!options || !options.github){
        return next('no options provided for github');
    }

    const ghOptions = options.github;
    ghOptions.scope = ['user:email', 'gist'];
    ghOptions.provider = 'github';

    server.register(Bell)
        .then(() => {

            server.auth.strategy('github', 'bell', ghOptions);
        })
        .catch((err) => next(err));
};

exports.register.attributes = {
    pkg: require('./package.json')
};
