const dotenv = require('dotenv')

dotenv.config()

const config = {
  // server
  PORT: process.env.PORT,

  // DB
  DB_URI: process.env.DB_URI,

  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,

  DB_NAME: process.env.DB_NAME,

  // jwt
  JWT_SECRET: process.env.JWT_SECRET,

  ALLOWED_POST_ROUTES: ['/auth/login', '/auth/register'],
  ALLOWED_GET_ROUTES: ['/auth/login'],
}

config.DB_CONNECTION_STRING = (() => {
  let URI = `${config.DB_USERNAME}:${encodeURIComponent(config.DB_PASSWORD)}@${config.DB_URI}/${config.DB_NAME}?retryWrites=true&w=majority`
  return config.DB_URI.includes('localhost') ? `mongodb://${URI}&authSource=admin` : `mongodb+srv://${URI}`
})()

module.exports = config
