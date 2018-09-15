const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')
const config = require('../utils/config')

function render(symbol, trades) {
    console.clear()
    const windowWidth = size.get().width
    const { mainTableWidth, innerTableWidth } = calculateTableWidths(windowWidth)
    const table = new Table({
        head: ['LAST TRADES'],
        style: { head: ['gray'] },
        colWidths: [mainTableWidth]
    })

    const innerTableOptions = {
        head: ['Price', 'Quantity', 'Time'],
        style: { head: ['gray'] },
        colWidths: [innerTableWidth, innerTableWidth, innerTableWidth],
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

    const ui = []

    const leftHeader = `Market: ${symbol.toUpperCase()}`
    const rightHeader = 'L2QQ Exchange'

    ui.push('')
    ui.push(' ' + leftHeader.bold + ' '.repeat(windowWidth - 1 - leftHeader.length - rightHeader.length - 1) + rightHeader.bold.cyan)
    ui.push('')

    table.push([innerTable])

    trades.forEach((trade) => {
        innerTable.push([
            trade.maker ? trade.price.red : trade.price.green,
            trade.quantity.white,
            formatTime(new Date(trade.time)).white
        ])
    })

    ui.push(table.toString())
    console.log(ui.join('\n') + '\n')
}

function trades(symbol) {
    render(symbol, [])

    const limit = 20
    this.trades = []

    const rest = new binance.BinanceRest({})
    rest._baseUrl = config.restBaseUrl

    const ws = new binance.BinanceWS(true)
    ws._baseUrl = config.wsBaseUrl + 'ws/';
    ws._combinedBaseUrl = config.wsBaseUrl + 'stream?streams=';

    ws.onTrade(symbol, (trade) => {
        this.trades.unshift(trade)
        this.trades = this.trades.slice(0, limit)
        render(symbol, this.trades)
    }).on('open', () => {
        rest.trades(symbol.toUpperCase()).then((trades) => {
            const ids = this.trades.map(t => t.tradeId)
            trades = trades.filter(t => !ids.includes(t.id))
            this.trades = this.trades.concat(trades.map(t => ({
                orderId: t.id,
                price: t.price,
                quantity: t.qty,
                maker: t.isBuyerMaker,
                time: t.time
            })))
            this.trades.sort((a, b) => {
                return b.orderId - a.orderId
            })
            this.trades = this.trades.slice(0, limit)
            render(symbol, this.trades)
        })
    })

    process.stdout.on('resize', () => {
        render(symbol, this.trades)
    })
}

function calculateTableWidths(windowWidth) {
    const mainTableWidth = windowWidth - 3
    const innerTableWidth = Math.floor((mainTableWidth - 4) / 3)
    return { mainTableWidth, innerTableWidth }
}

function formatTime(date) {
    return `${date.getHours().toString().padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}:${date.getSeconds().toString().padStart(2, 0)}`
}

module.exports = (program) => {
    program
        .command('trades <symbol>')
        .description('View the last trades of a specified market')
        .action(trades)
}
