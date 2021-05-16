const express = require('express')
const StockController = require('../controllers/stocks')
const Joi = require('joi')
const { STOCKS_STATUS } = require('../constants')
const validate = require('../middlewares/validate-request')
const StockRouter = express.Router({ mergeParams: true })

StockRouter.route('/last-stocks').get(StockController.getLastStocks)
StockRouter.route('/').get(StockController.getStocks)
StockRouter.route('/:stockId')
  .get(StockController.getStock)
  .patch(
    validate(
      Joi.object({
        name: Joi.string(),
        value: Joi.number(),
        status: Joi.string().valid(...STOCKS_STATUS),
      }).keys({})
    ),
    StockController.updateStock
  )

module.exports = StockRouter
