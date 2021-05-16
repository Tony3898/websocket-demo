const express = require('express')
const { formatError } = require('./utils/hooks')
const app = express()

// express helper
app.use(require('response-time')())
app.use(require('helmet')())
app.use(require('compression')())
app.use(require('cors')())
app.use(require('body-parser').json({ type: 'application/json' }))

//middlewares
app.use(require('./middlewares/jsonWebToken').validate)
app.use(require('./middlewares/validate-request')())

//routes
app.use('/auth', require('./routes/auth'))
app.use('/users', require('./routes/user'))
app.use('/users/*', require('./routes/user'))
app.use('/stocks', require('./routes/stocks'))
app.use('/stocks/*', require('./routes/stocks'))

// route not found
app.use((req, res) => {
  res.status(404).send('Route not found')
})

// in case any error
app.use((err, req, res, next) => {
  if (!err) return next()
  const { status, response } = formatError(err)
  res.status(status).send(response)
})

module.exports = app
