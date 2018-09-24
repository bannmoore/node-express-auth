const passport = require('passport')

class MockOidcStrategy extends passport.Strategy {
  constructor({ authUrl }) {
    super()
    this.name = 'mockOidc'
    this._authUrl = authUrl
    this._cb = (issuer, sub, profile, accessToken, refreshToken, done) => {
      return done(null, profile)
    }
  }

  authenticate(name, { successRedirect, failureRedirect }) {
    if (successRedirect) {
      return this._cb(null, null, {}, null, null, (err, user) => {
        this.success(user)
      })
    }
    return this.redirect(this._authUrl)
  }
}

module.exports = MockOidcStrategy