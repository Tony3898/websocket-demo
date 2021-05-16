const mongoose = require('mongoose')
const { DB_CONNECTION_STRING } = require('../config')

mongoose
  .connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .catch(err => console.error('Connection error: ', err))

const db = mongoose.connection

module.exports = db
