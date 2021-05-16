const { passwordHashing, slug, passwordComparing } = require('../utils/hooks')
const userModel = require('../models/users')
const { USER_STATUS } = require('../constants')
const { sign } = require('../middlewares/jsonWebToken')

exports.registerUser = async (req, res, next) => {
  try {
    let { firstName, lastName, organizationName, password, email, userType } = req.body
    if (!email || !password) throw new Error('Email/Password missing')
    let userExisted = await userModel.exists({ email })
    if (userExisted) throw new Error(`sorry! but ${email} already exists`)
    let userId = await slug(email.trim().split('@')[0])
    password = await passwordHashing(password)
    let user = await userModel.create({ firstName, lastName, password, email, userId, userType, organizationName })
    let _user = await userModel.omitSensitiveFields(user)
    res.status(200).send(_user)
  } catch (err) {
    next(err)
  }
}

exports.login = async (req, res, next) => {
  try {
    const { email, password: currentPassword } = req.body
    if (!email) throw new Error('Please provide email')
    let user = await userModel.findOne({ email }).select('+password')
    if (!user) throw new Error('Email is not register')
    if (user.status !== USER_STATUS[0]) throw new Error(`User is ${user.status}`)
    const { password: savedPassword, ...userData } = user.toJSON()
    const passwordMatch = await passwordComparing(currentPassword, savedPassword)
    if (!passwordMatch) throw new Error('Password mismatch')
    userData.token = sign({ ...userData, type: 'user' })
    res.status(200).send(userData)
  } catch (e) {
    next(e)
  }
}
