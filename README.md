# maitredhotel
[![Build Status](https://travis-ci.org/leanhubIo/maitredhotel.svg?branch=master)](https://travis-ci.org/leanhubIo/maitredhotel)
always here to gently welcome you

# Introduction

maitredhotel is a hapi plugin. It allows user based on Github.
This means that to be authenticated on this plugin, a user must have a Github account.
Then the user is saved in the database and further authentication are made using a simple randomy issued token.

# Configuration

The configuration object is as follow:
```json
  {
    "github": {
      "password": "string",
      "clientId": "string",
      "clientSecret": "string",
      "isSecure": "boolean"
    }
}
```
See [Bell](https://github.com/hapijs/bell) documentation here.
