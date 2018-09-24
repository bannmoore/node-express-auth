var defaultPassport = require('passport')
var OidcStrategy = require('passport-openidconnect').Strategy
var express = require('express')
var defaultSession = require('express-session')
var environment = require('./environment')

module.exports = class Auth {
  constructor({ passport, sessionHandler } = {}) {
    this.passport = passport || defaultPassport
    this.sessionHandler = sessionHandler || defaultSession

    this.passport.use(
      'oidc',
      new OidcStrategy(
        {
          issuer: environment.oauthIssuer,
          authorizationURL: environment.oauthAuthorizationUrl,
          tokenURL: environment.oauthTokenUrl,
          userInfoURL: environment.oauthUserInfoUrl,
          clientID: environment.oauthClientId,
          clientSecret: environment.oauthClientSecret,
          callbackURL: environment.oauthCallbackUrl,
          scope: 'openid profile'
        },
        (issuer, sub, profile, accessToken, refreshToken, done) => {
          return done(null, profile)
        }
      )
    )

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
    app.use(this.passport.authenticate('oidc', { failureRedirect: failureRedirectUrl }),
      (req, res) => {
        res.redirect(redirectUrl)
      })
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
      req.session.destroy()
      res.redirect(redirectUrl)
    }
  }
}