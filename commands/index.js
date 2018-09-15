const depth = require('./depth')
const trades = require('./trades')
const buy = require('./buy')
const sell = require('./sell')
const orders = require('./orders')
const balances = require('./balances')
const terminal = require('./terminal')
const cancel = require('./cancel')

module.exports = {
    depth,
    trades,
    buy,
    sell,
    orders,
    balances,
    terminal,
    cancel
}
