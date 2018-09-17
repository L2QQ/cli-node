const readline = require('readline')
const binance = require('binance')
const config = require('../utils/config')

index = 0
interval = null

function tickSpinner() {
    process.stdout.write('\r' + ['🙈', '🙉', '🙊'][++index % 3] + ' Authing...')
}

function startSpinner() {
    tickSpinner()
    interval = setInterval(() => {
        tickSpinner()
    }, 300)
}

function stopSpinner() {
    clearInterval(interval)
    process.stdout.write('\r                              \r')
}

async function auth() {
    console.log('Welcome to L2QQ exchange!'.bold.cyan)
    console.log('Let start'.bold.cyan)
    console.log()

    const { ethKey, qtumKey } = await askKeys()

    //const ethKey = '1' 
    //const qtumKey = 'd'

    /*
    const rest = new binance.BinanceRest({})
    rest._baseUrl = config.api.restBaseUrl
    rest.auth({
        ethKey,
        qtumKey
    })
    */

    console.log()

    startSpinner()


    setTimeout(() => {
        stopSpinner()
        console.log('🎉 Account created'.bold)

        console.log()
        console.log('Use these keys to trade')
        console.log('API key:', '5a2b7750a35510214889779e702c34051236ea6981defa7fbeadd1a77770fc70')
        console.log('Secret key:'.red, 'ac7f7510c9e831e1646994d34d16fac9c641260da65c24226f81867e89fd4642'.red)
        console.log()
        console.log('Safe trading!')
        console.log()
    }, 2500)
}

async function askKeys() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    let ethKey
    let qtumKey

    while (true) {
        ethKey = await question(rl, 'Enter your ETH private key (in hex):\n'.bold)
        if (ethKey == '') {
            console.log('Empty key, try again!\n'.red)
        } else if (!isValidKey(ethKey)) {
            console.log('Invalid key, try again!\n'.red)
        } else {
            break
        }
    }

    console.log()

    while (true) {
        qtumKey = await question(rl, 'Enter your QTUM private key (in hex):\n'.bold)
        if (ethKey == '') {
            console.log('Empty key, try again!\n'.red)
        } else if (!isValidKey(qtumKey)) {
            console.log('Invalid key, try again!\n'.red)
        } else {
            break
        }
    }

    rl.close()

    return { ethKey, qtumKey }
}

function isValidKey(key) {
    return /^[0-9A-Za-z]{64}$/.test(key)
}

function question(rl, title) {
    return new Promise((resolve, reject) => {
        rl.question(title, (answer) => {
            resolve(answer)
        })
    })
}


module.exports = (program) => {
    program
        .command('auth')
        .description('Auth')
        .action(auth)
}
