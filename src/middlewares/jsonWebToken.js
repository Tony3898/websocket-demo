const jwt = require('jsonwebtoken')

const { JWT_SECRET, ALLOWED_POST_ROUTES, ALLOWED_GET_ROUTES } = require('../config')
const getPermissions = require('../constants/permissions')

exports.validate = (req, res, next) => {
  const { method, path: route } = req
  if (method === 'GET' && ALLOWED_GET_ROUTES.includes(route.trim())) return next()
  if (method === 'POST' && ALLOWED_POST_ROUTES.includes(route.trim())) return next()

  const bearer = req.headers['authorization']
  if (!bearer) return res.status(401).send('Token not found!')
  else {
    const token = bearer.split(' ')[1]
    jwt.verify(token, JWT_SECRET, (err, payload) => {
      if (err) return res.status(401).send('Invalid token!')

      if (!getPermissions(payload.userType).includes(method)) return res.status(400).send("Sorry you don't have permission to access")

      /*
       * Used very simple mechanism for user check and permission
       * but for long run, I guess we can different mechanism
       * one which I think is that, we can create different group
       * and add users to that group and permissions they will have will be according
       * to the group they are on
       * */

      req.jwtPayload = payload
      next()
    })
  }
}

exports.sign = payload => jwt.sign(payload, JWT_SECRET, { expiresIn: '30 days' })
