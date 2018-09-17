const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')
const config = require('../utils/config')

function renderHorizontally(symbol, asks, bids) {
    console.clear()
    const winSize = size.get()
    const mainWidth = Math.floor((winSize.width - 3) / 2)
    const innterWidth = Math.floor((mainWidth - 3) / 2)

    const table = new Table({
        head: ['ASKS', 'BIDS'],
        style: { head: ['gray'] },
        colWidths: [mainWidth, mainWidth]
    })

    const options = {
        head: ['Price', 'Amount'],
        style: { head: ['gray'] },
        colWidths: [innterWidth, innterWidth],
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

    const askTable = new Table(options)
    const bidTable = new Table(options)

    const ui = []

    const leftHeader = `Market: ${symbol.toUpperCase()}`
    const rightHeader = 'L2QQ Exchange'

    ui.push('')
    ui.push(' ' + leftHeader.bold + ' '.repeat(winSize.width - 1 - leftHeader.length - rightHeader.length - 1) + rightHeader.bold.cyan)
    ui.push('')

    table.push([askTable, bidTable])

    const max = winSize.height - 10
    asks = asks.slice(0, max)
    bids = bids.slice(0, max)

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

function renderVertically(symbol, asks, bids) {
    console.clear()
    const winSize = size.get()
    const ui = []

    const column = Math.floor((winSize.width - 6) / 2)

    const table = new Table({
        head: ['ORDERBOOK'],
        style: { head: ['gray'] },
        colWidths: [winSize.width - 2]
    })

    const chars = {
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

    const askTable = new Table({
        style: { head: ['gray'] },
        colWidths: [column, column],
        chars: chars
    })
    const bidTable = new Table({
        colWidths: [column, column],
        chars: chars
    })

    function interBook() {
        return '' //'Last price: ' + '142.0043000'.red + '  Spread: 0.45%'
    }

    rows = Math.floor((winSize.height - 12) / 2)

    asks = asks.slice(0, rows)
    asks = asks.concat(Array(rows - asks.length).fill(null))
    asks.reverse()
    asks.forEach(ask => {
        if (ask) {
            askTable.push([ask[0].padStart(16).red, ask[1].padStart(16).gray])
        } else {
            askTable.push(['', ''])
        }
    })

    bids = bids.slice(0, rows)
    bids = bids.concat(Array(rows - bids.length).fill(null))
    bids.forEach(bid => {
        if (bid) {
            bidTable.push([bid[0].padStart(16).green.padStart(20), bid[1].padStart(16).gray])
        } else {
            bidTable.push(['', ''])
        }
    })

    table.push([askTable])
    table.push([interBook()])
    table.push([bidTable])

    const leftHeader = `Market: ${symbol.toUpperCase()}`
    const rightHeader = 'L2QQ Exchange'

    ui.push('')
    ui.push(' ' + leftHeader.bold + ' '.repeat(winSize.width - 1 - leftHeader.length - rightHeader.length - 1) + rightHeader.bold.cyan)
    ui.push('')

    ui.push(table.toString())
    console.log(ui.join('\n') + '\n')
}

function depth(symbol, cmd) {
    const render = cmd.vertical ? renderVertically : renderHorizontally
    render(symbol, [], [])

    let asks = []
    let bids = []

    const ws = new binance.BinanceWS(true)
    ws._baseUrl = config.api.wsBaseUrl + 'ws/'
    ws._combinedBaseUrl = config.api.wsBaseUrl + 'stream?streams='

    ws.onDepthLevelUpdate(symbol, 20, (depth) => {
        asks = depth.asks
        bids = depth.bids
        render(symbol, asks, bids)
    })

    process.stdout.on('resize', () => {
        render(symbol, asks, bids)
    })
}

module.exports = (program) => {
    program
        .command('depth <symbol>')
        .description('View the order book for a specified market')
        .option('-v, --vertical', 'Show order book vertically')
        .action(depth)
}
