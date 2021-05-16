const Joi = require('joi')

const getNameFields = () => ({
  firstName: Joi.string()
    .allow(null)
    .trim()
    .regex(/^[a-zA-Z.' ]+$/, 'name')
    .label('First Name'),
  lastName: Joi.string()
    .allow(null)
    .trim()
    .regex(/^[a-zA-Z.' ]+$/, 'name')
    .label('Last Name'),
})

const getEmailField = () => Joi.string().allow(null, '').trim().label('Email').email({ minDomainSegments: 2 })

const bodySchema = Joi.object()
  .keys({
    _id: Joi.valid(null),
    slug: Joi.valid(null),
    ...getNameFields(),
    email: getEmailField(),
    password: Joi.string().allow(null).trim().min(8).max(32).label('Password'),
    status: Joi.string().allow(null),
    createdAt: Joi.valid(null),
    updatedAt: Joi.valid(null),
  })
  .unknown(true)

const querySchema = Joi.object()
  .keys({
    limit: Joi.number().label('Limit'),
  })
  .unknown(true)

// eslint-disable-next-line no-unused-vars
const customHeaderValidation = (value, helper) => {
  if (!['application/json', 'multipart/form-data'].some(i => value.includes(i))) {
    throw new Error('it can not be [' + value.split(';')[0] + ']')
  }
  return value
}
const headersSchema = Joi.object()
  .keys({
    'Content-Type': Joi.string().trim().label('Content-Type').custom(customHeaderValidation),
    'content-type': Joi.string().trim().label('Content-Type').custom(customHeaderValidation),
  })
  .unknown(true)

module.exports = { body: bodySchema, query: querySchema, headers: headersSchema }
