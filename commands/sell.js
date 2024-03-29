const order = require('./order')

function sell(symbol, qty, price, cmd) {
    order(symbol, 'SELL', qty, price, cmd)
}

module.exports = (program) => {
    program
        .command('sell <symbol> <qty> [price]')
        .description('Sell')
        .option('-s, --sign', 'Sign order')
        .action(sell)
}
