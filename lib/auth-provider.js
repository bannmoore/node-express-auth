const request = require('request-promise')
const environment = require('./environment')
const Base64 = require('js-base64').Base64
const uuid = require('uuid')
const jwt = require('jsonwebtoken')

module.exports = class AuthProvider {
  constructor() {
    this.client = request.defaults({
      baseUrl: environment.oauthIssuer
    })
    this.state = uuid()
  }

  getAuthorizeUrl() {
    return `${environment.oauthIssuer}/v1/authorize?` +
      `client_id=${environment.oauthClientId}` +
      '&response_type=code' +
      '&scope=openid profile' +
      `&redirect_uri=${environment.oauthCallbackUrl}` +
      `&state=${this.state}`
  }

  getToken(code) {
    return this.client.post('/v1/token', {
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded',
        authorization: `Basic ${Base64.encode(`${environment.oauthClientId}:${environment.oauthClientSecret}`)}`,
      },
      form: {
        grant_type: 'authorization_code',
        redirect_uri: environment.oauthCallbackUrl,
        code,
      }
    }).then(res => JSON.parse(res))
  }

  getUserInfo(accessToken) {
    return this.client.post('/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(res => JSON.parse(res))
  }

  validateState(state) {
    return state === this.state
  }

  validateAccessToken(accessToken) {
    return this.client.get('/v1/keys')
      .then(res => JSON.parse(res))
      .then(data => {
        var key = data.keys[0]
        var decoded = jwt.decode(accessToken, { complete: true })
        return decoded.header.kid === key.kid
      })
  }
}