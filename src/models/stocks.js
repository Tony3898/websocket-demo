const mongoose = require('mongoose')
const { omit } = require('lodash')
const { STOCKS_STATUS } = require('../constants')
const Schema = mongoose.Schema

const StockSchema = new Schema(
  {
    stockId: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
    status: {
      type: String,
      default: STOCKS_STATUS[0],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
)

StockSchema.static('omitSensitiveFields', function (Document) {
  return omit(Document.toJSON(), [])
})

module.exports = mongoose.model('stocks', StockSchema)
