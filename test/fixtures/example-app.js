var express = require('express');
var Auth = require('../../lib/auth')

var auth = new Auth()

var app = express();

app.use(auth.session());

app.get('/login', auth.authenticate())
app.get(
  '/auth/return',
  auth.authenticateWithRedirect({
    failureRedirectUrl: '/error',
    redirectUrl: '/'
  })
)
app.get('/logout', auth.logout({ redirectUrl: '/' }))

app.get('/', (req, res) => res.send('okay'));
app.get('/protected', auth.protected({ loginUrl: '/login' }), (req, res) => res.send('protected'));

module.exports = app
