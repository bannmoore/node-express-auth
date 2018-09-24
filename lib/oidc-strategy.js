var OidcStrategy = require('passport-openidconnect').Strategy
var environment = require('./environment')

module.exports = new OidcStrategy(
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