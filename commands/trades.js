const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')
const config = require('../utils/config')

function render(symbol, trades) {
    console.clear()
    const winSize = size.get()
    const { mainTableWidth, innerTableWidth } = calculateTableWidths(winSize.width)
    const table = new Table({
        head: ['LAST TRADES'],
        style: { head: ['gray'] },
        colWidths: [mainTableWidth]
    })

    trades = trades.map(t => t)
    trades.reverse()

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
    ui.push(' ' + leftHeader.bold + ' '.repeat(winSize.width - 1 - leftHeader.length - rightHeader.length - 1) + rightHeader.bold.cyan)
    ui.push('')

    table.push([innerTable])

    const max = winSize.height - 10
    trades = trades.slice(0, max)

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

    const limit = 100
    this.trades = []

    const rest = new binance.BinanceRest({})
    rest._baseUrl = config.api.restBaseUrl

    setInterval(() => {
        rest.trades(symbol.toUpperCase()).then((trades) => {


            this.trades = trades.map(t => ({
                orderId: t.id,
                price: t.price,
                quantity: t.qty,
                maker: t.isBuyerMaker,
                time: t.time
            }))
            render(symbol, this.trades)
        })
    }, 300)

    process.stdout.on('resize', () => {
        render(symbol, this.trades)
    })

/*
    const ws = new binance.BinanceWS(true)
    ws._baseUrl = config.api.wsBaseUrl + 'ws/'
    ws._combinedBaseUrl = config.api.wsBaseUrl + 'stream?streams='

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
*/
    
}

function calculateTableWidths(windowWidth) {
    const mainTableWidth = windowWidth - 2
    const innerTableWidth = Math.floor((mainTableWidth - 3) / 3)
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
