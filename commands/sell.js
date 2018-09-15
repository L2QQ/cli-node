const order = require('./order')

function sell(symbol, qty, price) {
    order(symbol, 'SELL', qty, price)
}

module.exports = (program) => {
    program
        .command('sell <symbol> <qty> [price]')
        .description('Sell')
        .action(sell)
}
