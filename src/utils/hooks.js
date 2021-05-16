const { ValidationError } = require('joi')
const { Error: MongooseError } = require('mongoose')
const slugify = require('slugify')
const bcrypt = require('bcrypt')
const _ = require('lodash')
let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const formatJoiErrorMessage = message => {
  return message.replace(/"/g, '')
}

const formatMongooseErrorMessage = message => {
  return message.replace(/(Path |`|\.)/g, '')
}

const getPaginationData = (query, aggregate = false) => {
  const { page, limit, sortBy, order, ...filters } = query
  const pagination = {
    filters: filters || '{}',
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    sortBy: sortBy || 'createdAt',
    order: aggregate ? (order ? Number(order) : -1) : 'desc',
  }

  let sort = {}
  sort = { ...sort, [pagination.sortBy]: pagination.order }

  return { sort, pagination }
}

exports.paginate = async (Model, query) => {
  const { sort, pagination } = getPaginationData(query)
  const totalItems = await Model.estimatedDocumentCount()
  const filteredItemsCount = await Model.countDocuments(pagination.filters)
  let data = await Model.find(pagination.filters)
    .sort(sort)
    .skip((parseInt(pagination.page) - 1) * pagination.limit)
    .limit(pagination.limit)

  return { data, totalItems, filteredItemsCount, totalPages: Math.ceil(filteredItemsCount / pagination.limit) }
}

exports.paginateWithAggregation = async (Model, query, pipeline = []) => {
  const { sort, pagination } = getPaginationData(query, true)
  const totalItems = await Model.estimatedDocumentCount()
  const [{ count: filteredItemsCount } = { count: 0 }] = await Model.aggregate([
    { $match: pagination.filters },
    ...pipeline,
    { $count: 'count' },
  ])
  let data = await Model.aggregate([
    {
      $match: pagination.filters,
    },
    ...pipeline,
    { $sort: sort },
    { $skip: (parseInt(pagination.page) - 1) * pagination.limit },
    { $limit: pagination.limit },
  ])
  return { data, totalItems, filteredItemsCount, totalPages: Math.ceil(filteredItemsCount / pagination.limit) }
}

exports.formatError = err => {
  let status = err.status || 400
  let response = err.message || 'Something went wrong!'

  // body-parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    status = 400
    response = 'Invalid JSON!'
  }

  // Joi validation error
  if (err instanceof ValidationError) {
    status = 422
    const errors = err.details
    const rootError = errors.filter(e => !e.path.length)[0]
    if (rootError) response = formatJoiErrorMessage(rootError.message)
    else {
      const errorsObject = {}
      errors.forEach(e => _.set(errorsObject, e.path, formatJoiErrorMessage(e.message)))
      response = errorsObject
    }
  }

  if (err instanceof MongooseError.ValidationError) {
    status = 422
    const errors = Object.values(err.errors)

    const errorsObject = {}
    errors.forEach(e => _.set(errorsObject, e.path, formatMongooseErrorMessage(e.message)))
    response = errorsObject
  }

  // mongo error
  if (err.name === 'MongoError') {
    status = 400
    if (err.code === 11000) {
      const key = err.message.split('index: ')[1].split('_')[0]
      response = { [key]: `Document already exists with given value of ${key}` }
    }
  }

  console.error(`Error occurred with status ${status} and response ${JSON.stringify(response, null, 2)}`)
  return { status, response }
}

exports.slug = str => {
  if (typeof str !== 'string') throw new Error('Please provide valid string')
  return slugify(str, {
    replacement: '-',
    remove: undefined,
    lower: true,
    strict: false,
  })
}

exports.passwordHashing = async password => {
  if (!password || password.length < 8) throw new Error('Please provide valid password')

  return await bcrypt.hash(password, 12)
}

exports.passwordComparing = async (currentPassword, savedPassword) => {
  if (!currentPassword || currentPassword.length < 8) throw new Error('Please provide valid password')

  if (!savedPassword) throw new Error('Invalid credentials')

  return await bcrypt.compare(currentPassword, savedPassword)
}

exports.generateString = (length, includeNumbers = false) => {
  let result = ' '
  if (includeNumbers) characters += '1234567890'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}
