const binance = require('binance')
const config = require('../utils/config')

function renderSuccess(res) {
    console.log('ORDER CANCELLED'.bold.cyan)
}

function renderError(err) {
    console.error('CANCEL_REJECTED'.bold.red)
    if (err.msg) {
        console.error(err.msg.gray)
    } else if (err.message) {
        console.error(err.message.gray)
    } else {
        console.error(err)
    }
    console.error()
}

function cancel(symbol, orderId) {
    if (!(config.api && config.api.key && config.api.secret)) {
        return console.error('Setup api key and secret in your config (~/.l2qq.json)')
    }
    const api = new binance.BinanceRest({
        key: config.api.key,
        secret: config.api.secret
    })
    api._baseUrl = config.api.restBaseUrl

    console.log(`\nMarket: ${symbol.toUpperCase()}\n`.bold)

    api.cancelOrder({
        symbol: symbol.toUpperCase(),
        orderId: orderId
    }).then(renderSuccess).catch(renderError)
}

module.exports = (program) => {
    program
        .command('cancel <symbol> <orderId>')
        .description('Cancel order')
        .action(cancel)
}
