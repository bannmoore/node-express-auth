var chai = require('chai')
var chaiHttp = require('chai-http')

chai.use(chaiHttp)

describe('Auth', function () {

  var fakeAuthIssuer, testApp
  before(function () {

    process.env.OAUTH_ISSUER = 'http://localhost:8080'
    process.env.OAUTH_CALLBACK_URL = 'http://localhost:8081/auth/return'

    fakeAuthIssuer = require('./fixtures/fake-auth-issuer').listen(8080)
    testApp = require('./fixtures/test-app').listen(8081)
  })

  after(function () {
    fakeAuthIssuer.close()
    testApp.close()
  })

  it('should allow unauthenticated requests to unprotected routes', function (done) {
    chai.request('http://localhost:8081')
      .get('/')
      .end((err, res) => {
        chai.expect(err).to.be.null
        chai.expect(res).to.have.status(200)
        done()
      })
  })

  it('should redirect to login on protected routes', function (done) {
    chai.request('http://localhost:8081')
      .get('/protected')
      .end((err, res) => {
        chai.expect(err).to.be.null
        chai.expect(res).to.have.status(200)
        chai.expect(res.redirects[0]).to.include('/login')
        done()
      })
  })

  it('should set session cookie', function (done) {
    chai.request('http://localhost:8081')
      .get('/')
      .end((err, res) => {
        chai.expect(res).to.have.cookie('connect.sid')
        done()
      })
  })

  it('should destroy cookie and redirect on logout', function (done) {
    chai.request('http://localhost:8081')
      .get('/logout')
      .redirects(0)
      .end((err, res) => {
        chai.expect(res).to.have.status(302)
        chai.expect(res).not.to.have.cookie('connect.sid')
        done()
      })
  })

  it('should error when receiving an invalid state on return', function (done) {
    chai.request('http://localhost:8081')
      .get('/auth/return?state=invalid-state')
      .end((err, res) => {
        chai.expect(res.error).not.to.be.null
        chai.expect(res).to.have.status(500)
        done()
      })
  })
})