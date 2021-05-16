const express = require('express')
const UserController = require('../controllers/users')
const UserRouter = express.Router({ mergeParams: true })

UserRouter.route('/').get(UserController.getUsers)

module.exports = UserRouter
