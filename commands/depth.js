const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')

function render(symbol, asks, bids) {
    console.clear()
    const windowWidth = size.get().width
    const { mainTableWidth, innerTableWidth } = calculateTableWidths(windowWidth)
    const table = new Table({
        head: ['ASKS', 'BIDS'],
        style: { head: ['gray'] },
        colWidths: [mainTableWidth, mainTableWidth]
    })

    const innerTableOptions = {
        head: ['Price', 'Amount'],
        style: { head: ['gray'] },
        colWidths: [innerTableWidth, innerTableWidth],
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

    const askTable = new Table(innerTableOptions)
    const bidTable = new Table(innerTableOptions)

    const ui = []

    const leftHeader = `Market: ${symbol.toUpperCase()}`
    const rightHeader = 'L2QQ Exchange'

    ui.push('')
    ui.push(' ' + leftHeader.bold + ' '.repeat(windowWidth - 1 - leftHeader.length - rightHeader.length - 1) + rightHeader.bold.cyan)
    ui.push('')

    table.push([askTable, bidTable])

    asks.forEach((ask) => {
        let price = ask[0]
        let depth = ask[1]
        askTable.push([price.red, depth.white])
    })

    bids.forEach((bid) => {
        let price = bid[0]
        let depth = bid[1]
        bidTable.push([price.green, depth.white])
    })

    ui.push(table.toString())
    console.log(ui.join('\n') + '\n')
}

function depth(symbol) {
    render(symbol, [], [])

    let asks = []
    let bids = []

    const ws = new binance.BinanceWS(true)
    ws.onDepthLevelUpdate(symbol, 10, (data) => {
        asks = data.asks
        bids = data.bids
        render(symbol, asks, bids)
    })

    process.stdout.on('resize', () => {
        render(symbol, asks, bids)
    })
}

function calculateTableWidths(windowWidth) {
    const mainTableWidth = Math.floor((windowWidth - 3) / 2)
    const innerTableWidth = Math.floor((mainTableWidth - 3) / 2)

    return { mainTableWidth, innerTableWidth }
}

module.exports = (program) => {
    program
        .command('depth <symbol>')
        .description('View the order book for a specified market')
        .option('-v, --vertical', 'Show order book vertically')
        .action(depth)
}
