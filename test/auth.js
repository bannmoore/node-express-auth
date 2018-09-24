var chai = require('chai')
var chaiHttp = require('chai-http')
var createExampleApp = require('./fixtures/example-app')
var MockOidcStrategy = require('./fixtures/mock-oidc-strategy')

chai.use(chaiHttp)

describe('Auth', function () {

  var exampleApp
  before(function () {
    exampleApp = createExampleApp({
      strategy: new MockOidcStrategy({ authUrl: '/auth/return' })
    })
  })

  it('should allow unauthenticated requests to unprotected routes', function (done) {
    chai.request(exampleApp)
      .get('/')
      .end((err, res) => {
        chai.expect(err).to.be.null
        chai.expect(res).to.have.status(200)
        done()
      })
  })

  it('should redirect to login on protected routes', function (done) {
    chai.request(exampleApp)
      .get('/protected')
      .end((err, res) => {
        chai.expect(err).to.be.null
        chai.expect(res).to.have.status(200)
        chai.expect(res.redirects[0]).to.include('/login')
        done()
      })
  })

  it('should redirect to root on /auth/return', function (done) {
    chai.request(exampleApp)
      .get('/auth/return')
      .end((err, res) => {
        chai.expect(err).to.be.null
        chai.expect(res).to.have.status(200)
        chai.expect(res).to.redirect
        done()
      })
  })

  it('should set session cookie', function (done) {
    chai.request(exampleApp)
      .get('/')
      .end((err, res) => {
        chai.expect(res).to.have.cookie('connect.sid')
        done()
      })
  })

  it('should destroy cookie and redirect on logout', function (done) {
    chai.request(exampleApp)
      .get('/logout')
      .redirects(0)
      .end((err, res) => {
        chai.expect(res).to.have.status(302)
        chai.expect(res).not.to.have.cookie('connect.sid')
        done()
      })
  })
})