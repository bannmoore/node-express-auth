var express = require('express')

var server = express()

server.get('/v1/authorize', (req, res) => {
  res.redirect(`${req.query.redirect_uri}?code=fake-code?state=${req.query.state}`)
})
server.post('/v1/token', (req, res) => {
  res.send(JSON.stringify({ access_token: 'token' }))
})
server.post('/v1/userinfo', (req, res) => {
  res.send(JSON.stringify({ name: 'Jane Doe' }))
})

module.exports = server