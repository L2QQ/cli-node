function terminal() {

}

module.exports = (program) => {
    program
        .command('terminal <symbol>')
        .description('View terminal with order book, trades and open orders')
        .action(terminal)
}
