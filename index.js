const db = require('./src/utils/mongodb')
const { PORT } = require('./src/config')
const app = require('./src/app')
const CronJob = require('./src/utils/cron')
const { updateStocksCron, getStocksCron, createStocksManually } = require('./src/controllers/stocks')
const http = require('http')
const WebSocket = require('ws')

const server = http.createServer(app)
const wss = new WebSocket.Server({ server })

for (let i = 0; i < 10; i++) {
  createStocksManually()
    .then(r => console.log(r))
    .catch(e => console.log(e))
}

const updateStockCronJob = () => {
  return new CronJob('*/30 * * * * *', () => {
    updateStocksCron()
      .then(r => console.log(`updated ${r.length} stocks`))
      .catch(e => console.log(e))
  })
}

const getStocks = ws => {
  return new CronJob('*/30 * * * * *', () => {
    getStocksCron()
      .then(r => ws.send(JSON.stringify(r, null, 2)))
      .catch(e => console.log(e))
  })
}

wss.on('connection', ws => {
  getStocks(ws).start()
})

updateStockCronJob().start()

db.once('open', () => {
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT} in ${process.env.NODE_ENV} environment!`)
  })
})
