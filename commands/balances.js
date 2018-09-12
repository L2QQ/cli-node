const binance = require('binance')
const size = require('window-size')
const Table = require('cli-table')
const { config } = require('../utils')

function render(balances) {
    const windowWidth = size.get().width
    const table = new Table({
        head: ['', 'Available', 'In order'],
        style: { head: ['gray'] },
        colWidths: [12, 24, 24]
    })

    const ui = []

    const leftHeader = 'Balances'

    ui.push('')
    ui.push(' ' + leftHeader.bold)
    ui.push('')

    balances.forEach((balance) => {
        table.push([balance.asset, balance.free.green, balance.locked])
    })

    ui.push(table.toString())
    console.log(ui.join('\n') + '\n')
}

function balances() {
    const cnf = config()
    if (!cnf) {
        return console.error('Create config ~/.l2qq.json')
    }

    if (!cnf.key || !cnf.secret) {
        return console.error('Setup key and secrent in your config (~/.l2qq.json)')
    }

    const api = new binance.BinanceRest({
        key: cnf.key,
        secret: cnf.secret
    })

    api.account().then((account) => {
        const balances = account.balances.filter((balance) => {
            return parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0
        })
        render(balances)
    }).catch((err) => {
        console.error(err)
    })
}

module.exports = (program) => {
    program
        .command('balances')
        .description('View balances')
        .action(balances)
}
