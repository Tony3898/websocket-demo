const GLOBAL_SCHEMA = require('./global.schema')

const validator =
  (schema = GLOBAL_SCHEMA) =>
  (req, res, next) => {
    if (schema.headers) {
      const headersValidation = schema.headers.validate(req.headers, { abortEarly: false })
      if (headersValidation.error) return next(headersValidation.error)
      req.headers = headersValidation.value
    }

    if (schema.query) {
      const queryValidation = schema.query.validate(req.query, { abortEarly: false })
      if (queryValidation.error) return next(queryValidation.error)
      req.query = queryValidation.value
    }

    if (schema.params) {
      const queryValidation = schema.params.validate(req.params, { abortEarly: false })
      if (queryValidation.error) return next(queryValidation.error)
      req.params = queryValidation.value
    }

    if (schema.body) {
      const bodyValidation = schema.body.validate(req.body, { abortEarly: false })
      if (bodyValidation.error) return next(bodyValidation.error)
      req.body = bodyValidation.value
    }

    next()
  }

module.exports = validator
