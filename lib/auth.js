var express = require('express')
var defaultSession = require('express-session')
var environment = require('./environment')
var AuthProvider = require('./auth-provider')

var authProvider = new AuthProvider()

module.exports = class Auth {
  constructor({ sessionHandler } = {}) {
    this.sessionHandler = sessionHandler || defaultSession
  }

  session() {
    var app = express()

    app.use(this.sessionHandler({
      secret: environment.sessionSecret,
      resave: false,
      saveUninitialized: true
    }))

    return app
  }

  authenticate() {
    var app = express()
    app.use((req, res) => {
      res.redirect(authProvider.getAuthorizeUrl())
    })
    return app
  }

  authenticateWithRedirect({ failureRedirectUrl, redirectUrl }) {
    var app = express()
    app.use((req, res, next) => {
      if (!authProvider.validateState(req.query.state)) {
        throw new Error('Invalid State')
      }
      return authProvider.getToken(req.query.code)
        .then(body => {
          return authProvider.validateAccessToken(body.access_token)
            .then(isValid => {
              if (!isValid) {
                throw new Error('Invalid Token')
              }
              return authProvider.getUserInfo(body.access_token)
                .then(body => {
                  req.session.user = body
                  res.redirect(redirectUrl)
                })
            })
        })
    })
    return app
  }

  protected({ loginUrl }) {
    return (req, res, next) => {
      if (req.session.user) {
        return next()
      }

      res.redirect(loginUrl)
    }
  }

  logout({ redirectUrl }) {
    return (req, res) => {
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect(redirectUrl)
      })
    }
  }
}