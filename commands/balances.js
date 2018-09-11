function balances() {

}

module.exports = (program) => {
    program
        .command('balances')
        .description('View balances')
        .action(balances)
}
