const binance = require('binance')
const config = require('../utils/config')

function render(title) {
}

function renderError(err) {
    console.error('FAILURE'.bold.red)
    if (err.msg) {
        console.error(err.msg.gray)
    } else if (err.message) {
        console.error(err.message.gray)
    } else {
        console.error(err)
    }
    console.error()
}

function orders(symbol, cmd) {
    console.log(cmd)
    console.log(cmd.options)

    if (!config.key || !config.secret) {
        return console.error('Setup api key and secret in your config (~/.l2qq.json)')
    }
    const api = new binance.BinanceRest({
        key: config.key,
        secret: config.secret
    })
    api._baseUrl = config.restBaseUrl

    console.log(`\nMarket: ${symbol.toUpperCase()}\n`.bold)

    if (cmd.open) {
        api.openOrders(symbol.toUpperCase()).then(renderOrders).catch(renderError)
    } else {
        api.allOrders(symbol.toUpperCase()).then(renderOrders).catch(renderError)
    }
}

module.exports = (program) => {
    program
        .command('orders <symbol>')
        .description('View orders')
        .option('-o, --open', 'Show open orders')
        .option('-w, --watch', 'Show open orders')
        .action(orders)
}
