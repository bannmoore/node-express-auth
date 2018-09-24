var defaultPassport = require('passport')
var express = require('express')
var defaultSession = require('express-session')
var environment = require('./environment')
var oidcStrategy = require('./oidc-strategy')

module.exports = class Auth {
  constructor({ passport, sessionHandler, strategy } = {}) {
    this.passport = passport || defaultPassport
    this.sessionHandler = sessionHandler || defaultSession
    this.strategy = strategy || oidcStrategy

    this.passport.use('oidc', this.strategy)

    this.passport.serializeUser((user, next) => {
      next(null, user)
    })

    this.passport.deserializeUser((obj, next) => {
      next(null, obj)
    })
  }

  session() {
    var app = express()

    app.use(this.sessionHandler({
      secret: environment.sessionSecret,
      resave: false,
      saveUninitialized: true
    }))

    app.use(this.passport.initialize())
    app.use(this.passport.session())

    return app
  }

  authenticate() {
    var app = express()
    app.use(this.passport.authenticate('oidc'))
    return app
  }

  authenticateWithRedirect({ failureRedirectUrl, redirectUrl }) {
    var app = express()
    app.use(this.passport.authenticate('oidc', { successRedirect: redirectUrl, failureRedirect: failureRedirectUrl }))
    return app
  }

  protected({ loginUrl }) {
    return (req, res, next) => {
      if (req.isAuthenticated()) {
        return next()
      }

      res.redirect(loginUrl)
    }
  }

  logout({ redirectUrl }) {
    return (req, res) => {
      req.logout()
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect(redirectUrl)
      })
    }
  }
}