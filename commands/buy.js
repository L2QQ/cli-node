const order = require('./order')

function buy(symbol, qty, price, cmd) {
    order(symbol, 'BUY', qty, price, cmd)
}

module.exports = (program) => {
    program
        .command('buy <symbol> <qty> [price]')
        .description('Buy')
        .option('-s, --sign', 'Sign order')
        .action(buy)
}
