const stockModel = require('../models/stocks')
const { paginate, generateString } = require('../utils/hooks')

exports.createStocks = async (req, res, next) => {
  try {
    let stockData = req.body
    let _stock = await stockModel.create(stockData)
    let stock = await stockModel.omitSensitiveFields(_stock)
    res.status(200).send(stock)
  } catch (e) {
    next(e)
  }
}

exports.createStocksManually = async () => {
  try {
    let stockId = generateString(6, true)
    let exists = true
    while (exists) {
      exists = await stockModel.exists({ stockId })
      if (exists) stockId = generateString(6, true)
    }
    let name = generateString(4).trim() + ' ' + generateString(4).trim()
    let value = parseInt(Math.floor(Math.random() * 100) + 1)
    let _stock = await stockModel.create({ stockId, value, name })
    return await stockModel.omitSensitiveFields(_stock)
  } catch (e) {
    throw new Error(e.message)
  }
}

exports.getStocks = async (req, res, next) => {
  try {
    let query = req.query
    let _stocks = await paginate(stockModel, query)
    res.status(200).send(_stocks)
  } catch (e) {
    next(e)
  }
}

exports.getStock = async (req, res, next) => {
  try {
    let stockId = req.params.stockId
    let query = req.query

    let _stock = await stockModel.findOne({ stockId, ...query })
    let stock = await stockModel.omitSensitiveFields(_stock)
    res.status(200).send(stock)
  } catch (e) {
    next(e)
  }
}

exports.getLastStocks = async (req, res, next) => {
  try {
    let query = req.query

    if (!query['limit']) query['limit'] = 5
    if (!query['sortBy']) query['sortBy'] = 'updatedBy'

    let _stocks = await paginate(stockModel, query)
    res.status(200).send(_stocks)
  } catch (e) {
    next(e)
  }
}

exports.updateStock = async (req, res, next) => {
  try {
    let stockId = req.params.stockId
    const updates = req.body
    let _stock = await stockModel.findOneAndUpdate({ stockId }, updates, { new: true })
    if (!_stock) throw new Error('Stock not found!!!')
    let stock = await stockModel.omitSensitiveFields(_stock)
    res.status(200).send(stock)
  } catch (e) {
    next(e)
  }
}

exports.updateStocksCron = async () => {
  try {
    let time30 = new Date()
    time30.setSeconds(time30.getSeconds() - 30)
    let stocks = await stockModel.aggregate([
      {
        $match: { updatedAt: { $lt: new Date(time30) } },
      },
    ])
    return await Promise.all(
      stocks.map(
        async s =>
          await stockModel.findOneAndUpdate({ stockId: s.stockId }, { value: parseInt(Math.floor(Math.random() * 100) + 1) }, { new: true }),
      ),
    )
  } catch (e) {
    throw new Error(e.message)
  }
}

exports.getStocksCron = async () => {
  try {
    return await stockModel.find()
  } catch (e) {
    throw new Error(e.message)
  }
}
