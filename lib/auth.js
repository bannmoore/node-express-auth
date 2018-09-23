var defaultPassport = require('passport')
var OidcStrategy = require('passport-openidconnect').Strategy
var express = require('express')
var defaultSession = require('express-session')

module.exports = class Auth {
  constructor({ passport, sessionHandler } = {}) {
    this.passport = passport || defaultPassport
    this.sessionHandler = sessionHandler || defaultSession

    this.passport.use(
      'oidc',
      new OidcStrategy(
        {
          issuer: process.env.OAUTH_ISSUER,
          authorizationURL: process.env.OAUTH_AUTH_URL,
          tokenURL: process.env.OAUTH_TOKEN_URL,
          userInfoURL: process.env.OAUTH_USERINFO_URL,
          clientID: process.env.OAUTH_CLIENT_ID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          callbackURL: process.env.OAUTH_CALLBACK_URL,
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
      secret: 'MyVoiceIsMyPassportVerifyMe',
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

  authenticateWithRedirect() {
    var app = express()
    app.use(this.passport.authenticate('oidc', { failureRedirect: '/error' }),
      (req, res) => {
        res.redirect('/')
      })
    return app
  }

  protected() {
    return (req, res, next) => {
      if (req.isAuthenticated()) {
        return next()
      }

      res.redirect('/login')
    }
  }

  logout() {
    return (req, res) => {
      req.logout()
      req.session.destroy()
      res.redirect('/')
    }
  }
}