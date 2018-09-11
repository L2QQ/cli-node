function buy() {

}

module.exports = (program) => {
    program
        .command('buy <symbol> <qty> [price]')
        .description('Buy')
        .action(buy)
}
