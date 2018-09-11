function open() {

}

module.exports = (program) => {
    program
        .command('open [symbol]')
        .description('View open orders')
        .action(open)
}
