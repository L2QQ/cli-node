const binance = require('binance')
const Table = require('cli-table')
const config = require('../utils/config')

index = 0
interval = null

function tickSpinner() {
    process.stdout.write('\r' + ['🙈', '🙉', '🙊'][++index % 3] + ' Creating order...')
}

function startSpinner() {
    tickSpinner()
    interval = setInterval(() => {
        tickSpinner()
    }, 300)
}

function stopSpinner() {
    clearInterval(interval)
    process.stdout.write('\r                              \r')
}

function renderOrder(order) {
    stopSpinner()

    const leftWidth = 12
    const rightWidth = 14

    const w = 1 + leftWidth + rightWidth + 1

    let head = 'NEW ORDER'
    head = ' '.repeat(Math.floor((w - head.length) / 2)) + head

    const table = new Table({
        head: [head.bold],
        style: { head: ['cyan'] },
        colWidths: [w]
    })

    const innerTableOptions = {
        style: { head: ['gray'] },
        colWidths: [leftWidth, rightWidth],
        chars: {
            'top': '',
            'top-mid': '',
            'top-left': '',
            'top-right': '',
            'bottom': '',
            'bottom-mid': '',
            'bottom-left': '',
            'bottom-right': '',
            'left': '',
            'left-mid': '',
            'mid': '',
            'mid-mid': '',
            'right': '',
            'right-mid': '',
            'middle': ''
        }
    }

    const innerTable = new Table(innerTableOptions)
    table.push([innerTable])

    function title(key) {
        return key.padStart(leftWidth - 2).gray
    }
    function price() {
        if (order.type === 'MARKET') {
            return order.side === 'SELL' ? order.price.green : order.price.red
        } else {
            return order.side === 'SELL' ? order.price.red : order.price.green
        }
    }
    function status() {
        if (order.status === 'NEW') {
            return order.status.green
        } else if (order.status === 'CANCELED') {
            return order.status.yellow
        }
        return order.status.blue
    }
    function side() {
        return order.side === 'SELL' ? order.side.red : order.side.green
    }
    function avgPrice() {
        if (parseFloat(order.executedQty) == 0) {
            return (0).toFixed(8)
        }
        return (parseFloat(order.cummulativeQuoteQty) / parseFloat(order.executedQty)).toFixed(8)
    }

    innerTable.push([title('Order Id'), order.orderId])
    innerTable.push([title('Status'), status().bold])
    innerTable.push([title('Type'), order.type])
    innerTable.push([title('Side'), side()])
    if (order.price) {
        innerTable.push([title('Price'), price()])
    }
    innerTable.push([title('Quantity'), order.origQty])
    innerTable.push([title('Executed'), order.executedQty])
    innerTable.push([title('Avg Price'), avgPrice()])

    console.log(table.toString())
    console.log()
}

function renderError(err) {
    stopSpinner()
    console.log('FAILED ORDER'.red.bold)
    if (err.msg) {
        console.error(err.msg.gray)
    } else if (err.message) {
        console.error(err.message.gray)
    } else {
        console.error(err)
    }
    console.log()
}

module.exports = (symbol, side, qty, price) => {
    if (!config.key || !config.secret) {
        return console.error('Setup api key and secret in your config (~/.l2qq.json)')
    }
    const api = new binance.BinanceRest({
        key: config.key,
        secret: config.secret
    })
    api._baseUrl = config.restBaseUrl

    console.log()
    console.log(`Market: ${symbol.toUpperCase()}`.bold)
    console.log()

    let order = {
        symbol: symbol.toUpperCase(),
        side,
        quantity: qty,
        newOrderRespType: 'RESULT'
    }

    if (price) {
        order.type = 'LIMIT'
        order.price = price
        order.timeInForce = 'GTC'
    } else {
        order.type = 'MARKET'
    }

    startSpinner()
    api.newOrder(order).then(renderOrder).catch(renderError)
}
