const path = require('path')
const os = require('os')
const fs = require('fs')

const REST_BASE_URL = 'http://142.93.32.105/'
const WS_BASE_URL = 'ws://142.93.32.105:9050/'

var CONFIG = {
    restBaseUrl: REST_BASE_URL,
    wsBaseUrl: WS_BASE_URL,
}

try {
    const pathToConfig = path.resolve(os.homedir(), '.l2qq.json')
    const file = fs.readFileSync(pathToConfig)
    const json = JSON.parse(file)
    CONFIG = Object.assign(CONFIG, json)
} catch (err) {
    return null
}

module.exports = CONFIG
