function sell() {

}

module.exports = (program) => {
    program
        .command('sell <symbol> <qty> [price]')
        .description('Sell')
        .action(sell)
}
