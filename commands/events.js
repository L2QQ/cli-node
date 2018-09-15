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
        key: config.key,
        secret: config.secret
    })
    rest._baseUrl = config.restBaseUrl
    const ws = new binance.BinanceWS(true)
    ws._baseUrl = config.wsBaseUrl + 'ws/'
    ws._combinedBaseUrl = config.wsBaseUrl + 'stream?streams='
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
