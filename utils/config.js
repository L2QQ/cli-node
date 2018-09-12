const path = require('path')
const os = require('os')
const fs = require('fs')

module.exports = () => {
    try {
        const pathToConfig = path.resolve(os.homedir(), '.l2qq.json')
        const file = fs.readFileSync(pathToConfig)
        return JSON.parse(file)
    } catch (err) {
        return null
    }
}
