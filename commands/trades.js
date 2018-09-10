function render(symbol, trades) {

}

function trades(symbol) {

}

module.exports = (program) => {
    program
        .command('trades <symbol>')
        .description('View the last trades of a specified market')
        .action(trades)
}
