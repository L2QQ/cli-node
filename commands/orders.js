const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')
const config = require('../utils/config')

function renderOrders(orders) {
    const winSize = size.get()

    const table = new Table({
        head: ['ORDERS'],
        style: { head: ['gray'] },
        colWidths: [112]
    })

    const options = {
        head: ['Id', 'Status', 'Type', 'Side', 'Qty', 'Executed Qty', 'Price', 'Avg Price'],
        style: { head: ['gray'] },
        colWidths: [8, 18, 10, 10, 16, 16, 16],
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

    const innerTable = new Table(options)
    table.push([innerTable])

    orders.reverse()
    orders = orders.slice(0, 30)

    function side(order) {
        return order.side == 'BUY' ? order.side.green : order.side.red
    }

    function status(order) {
        if (order.status == 'NEW') {
            return order.status.green.bold
        } else if (order.status == 'FILLED') {
            return order.status.cyan.bold
        } else if (order.status == 'CANCELED') {
            return order.status.yellow.bold
        }
        return order.status.bold
    }

    function avgPrice(order) {
        if (parseFloat(order.executedQty) > 0) {
            return (parseFloat(order.cummulativeQuoteQty) / parseFloat(order.executedQty)).toFixed(8)
        }
        return ''
    }

    for (const order of orders) {
        innerTable.push([
            order.orderId,
            status(order),
            order.type,
            side(order),
            order.origQty,
            order.executedQty,
            order.price ? order.price : '',
            avgPrice(order)
        ])
    }

    //innerTable.push(['3', '4'])

    console.log(orders)
    
    console.log(table.toString())
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
    if (!config.key || !config.secret) {
        return console.error('Setup api key and secret in your config (~/.l2qq.json)')
    }
    const rest = new binance.BinanceRest({
        key: config.key,
        secret: config.secret
    })
    rest._baseUrl = config.restBaseUrl

    console.log(`\nMarket: ${symbol.toUpperCase()}\n`.bold)

    if (cmd.open) {
        rest.openOrders(symbol.toUpperCase()).then((orders) => {
            renderOrders(orders)
        }).catch(renderError)
    } else {
        rest.allOrders(symbol.toUpperCase()).then((orders) => {
            try {
                renderOrders(orders)
            } catch (err) {
                console.error(err)
            }
            
        }).catch(renderError)
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
