const path = require('path')
const os = require('os')
const fs = require('fs')

const CONFIG_NAME = '.l2qq.json'

const REST_BASE_URL = 'http://142.93.32.105/'
const WS_BASE_URL = 'ws://142.93.32.105:9050/'

var CONFIG = {
    restBaseUrl: REST_BASE_URL,
    wsBaseUrl: WS_BASE_URL,
}

function loadHomeConfig() {
    try {
        const pathToConfig = path.resolve(os.homedir(), CONFIG_NAME)
        const file = fs.readFileSync(pathToConfig)
        const json = JSON.parse(file)
        CONFIG = Object.assign(CONFIG, json)
    } catch (err) {
    }
}

function loadCwdConfig() {
    try {
        const pathToConfig = path.resolve(process.cwd(), CONFIG_NAME)
        const file = fs.readFileSync(pathToConfig)
        const json = JSON.parse(file)
        CONFIG = Object.assign(CONFIG, json)
    } catch (err) {
        loadHomeConfig()
    }
}

loadCwdConfig()
module.exports = CONFIG
