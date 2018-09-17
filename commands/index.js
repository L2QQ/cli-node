const depth = require('./depth')
const trades = require('./trades')
const buy = require('./buy')
const sell = require('./sell')
const cancel = require('./cancel')
const orders = require('./orders')
const balances = require('./balances')
const events = require('./events')
const auth = require('./auth')

module.exports = {
    depth,
    trades,
    buy,
    sell,
    cancel,
    orders,
    balances,
    events,
    auth
}
