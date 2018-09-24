var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var Auth = require('./lib/auth')

var auth = new Auth()

var indexRouter = require('./routes/index')
var usersRouter = require('./routes/users')

var app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(auth.session())

// auth routes
app.use('/login', auth.authenticate())
app.use(
  '/oauth/return',
  auth.authenticateWithRedirect({
    failureRedirectUrl: '/error',
    redirectUrl: '/'
  })
)
app.get('/logout', auth.logout({ redirectUrl: '/' }))

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use('/profile', auth.protected({ loginUrl: '/login' }), (req, res) => {
  res.render('profile', { title: 'Express', user: req.session.user })
})

module.exports = app
