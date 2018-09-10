const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')

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

    let trades = []

    const ws = new binance.BinanceWS(true)
    ws.onTrade(symbol, (data) => {
        trades.unshift(data)
        trades = trades.slice(0, 15)
        render(symbol, trades)
    })

    process.stdout.on('resize', () => {
        render(symbol, trades)
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
