const express = require('express')
const Joi = require('joi')
const AuthController = require('../controllers/auth')
const AuthRouter = express.Router({ mergeParams: true })
const validate = require('../middlewares/validate-request')

// login routes
AuthRouter.route('/login').post(
  validate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required().min(8),
    }),
  }),
  AuthController.login
)

// register routes
AuthRouter.route('/register').post(
  validate({
    body: Joi.object().keys({
      email: Joi.string().required(),
      password: Joi.string().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      organizationName: Joi.string(),
      userType: Joi.string().required(),
    }),
  }),
  AuthController.registerUser
)

module.exports = AuthRouter
