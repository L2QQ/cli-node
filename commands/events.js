const binance = require('binance')
const Table = require('cli-table')
const config = require('../utils/config')

function render(data) {
    if (data.eventType == 'executionReport') {
        console.log(data)
    }
}

function events() {
    const binance = require('binance')
    const rest = new binance.BinanceRest({
        key: config.api.key,
        secret: config.api.secret
    })
    rest._baseUrl = config.api.restBaseUrl
    const ws = new binance.BinanceWS(true)
    ws._baseUrl = config.api.wsBaseUrl + 'ws/'
    ws._combinedBaseUrl = config.api.wsBaseUrl + 'stream?streams='
    ws.onUserData(rest, (data) => {
        render(data)
    }, 60000)
}

module.exports = (program) => {
    program
        .command('events')
        .description('Listen user data stream')
        .action(events)
}
