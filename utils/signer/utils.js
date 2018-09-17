const assert = require('assert')
const BN = require('bn.js')
const Web3 = require('web3')

const ZERO_BN = new BN(0)
const ONE_BN = new BN(1)
const N_ONE_BN = new BN(-1)
const TEN_BN = new BN(10)
const MIN_INT256_BN = ONE_BN.shln(255).mul(N_ONE_BN)
const MAX_INT256_BN = ONE_BN.shln(255).add(N_ONE_BN)
const MAX_UINT256_BN = ONE_BN.shln(256).add(N_ONE_BN)

const CURRENCY_DIVIDERS = new Array(31)
for (let i = 0; i < CURRENCY_DIVIDERS.length; ++i) {
    CURRENCY_DIVIDERS[i] = TEN_BN.pow(new BN(CURRENCY_DIVIDERS.length - 1 - i))
}

const ZERO_ETHEREUM_ADDRESS_BUFFER = Buffer.alloc(20)
const ZERO_ETHEREUM_ADDRESS_HEX = `0x${ZERO_ETHEREUM_ADDRESS_BUFFER.toString('hex')}`


class Utils {

    /**
     * Checks if object is BigNumber.
     * @param {*} value Value which should be checked if instanse of BN class.
     * @returns {boolean} Flag indicating if specified value is instance of BN class.
     * @static
     */
    static isBN(value) {
        return BN.isBN(value)
    }

    /**
     * Converts number to BigNumber as instance of BN class ( https://github.com/indutny/bn.js/ ).
     * @param {(string|number|Buffer|BN|number[])} value Value which should be converted to big number (hex should be started with '0x').
     * @returns {BN} BigNumber value as instance of BN class.
     * @static
     */
    static toBN(value) {
        const type = typeof value
        if (type === 'number') {
            return Web3.utils.toBN(value)
        } else if (type === 'string') {
            if (Utils.isDecimalIntegralNumber(value) || Utils.isHexadecimalIntegralNumber(value)) {
                return Web3.utils.toBN(value)
            }
        } else if (value instanceof Buffer || BN.isBN(value) || value instanceof Array) {
            return new BN(value)
        }
        assert.fail()
    }

    /**
     * Converts signed number as string or BigNumber to int256 value as unsigned BigNumber.
     * @param {string|BN} value Number presenting signed value.
     * @returns {BN} Unsigned BigNumber presenting int256 value.
     * @static
     */
    static int256FromNumber(value) {
        const valueBN = BN.isBN(value) ? value : Utils.toBN(value)
        assert.ok(BN.isBN(valueBN) && valueBN.gte(MIN_INT256_BN) && valueBN.lte(MAX_INT256_BN))
        const negative = valueBN.lt(ZERO_BN)
        return negative ? MAX_UINT256_BN.add(valueBN).add(ONE_BN) : valueBN
    }

    /**
     * Converts hexadecimal signed number as string to int256 value as unsigned BigNumber.
     * @param {string} value Hexadecimal number as string (without '0x' at start) presenting signed value.
     * @returns {BN} Unsigned BigNumber presenting int256 value.
     * @static
     */
    static int256FromHex(value) {
        assert.ok(typeof value === 'string' && value.length <= 65)
        assert.ok(/^-?[0-9a-fA-F]*$/.test(value))
        const negative = value.length > 0 && value[0] === '-'
        const valueBN = negative ? Utils.toBN(`0x${value.slice(1)}`).mul(N_ONE_BN) : Utils.toBN(`0x${value}`)
        return Utils.int256FromNumber(valueBN)
    }

    /**
     * Converts unsigned BigNumber presenting int256 value to buffer.
     * @param {BN} value Unsigned BigNumber presenting int256 value.
     * @returns {string} Buffer presenting int256 value.
     * @static
     */
    static int256ToBuffer(value) {
        assert.ok(BN.isBN(value) && value.gte(ZERO_BN) && value.lte(MAX_UINT256_BN))
        return value.toBuffer('be', 32)
    }

    /**
     * Converts unsigned BigNumber presenting int256 value to hexadecimal number as string.
     * @param {BN} value Unsigned BigNumber presenting int256 value.
     * @returns {string} Hexadecimal number as string (without '0x' at start) presenting int256 value.
     * @static
     */
    static int256ToHex(value) {
        assert.ok(BN.isBN(value) && value.gte(ZERO_BN) && value.lte(MAX_UINT256_BN))
        return value.toString(16, 64)
    }

    /**
     * Converts BigNumber amount of atomic parts of a currency to human readable amount.
     * For example: currencyAtomicToFloat('1750000000000000000', 18) will return '1.75'.
     * @param {(string|BN)} amount Amount of atomic parts of a currency.
     * @param {number} decimals Amount of decimals of a currency.
     * @returns {string} Human readable amount of currency.
     * @static
     */
    static currencyAtomicToFloat(amount, decimals) {
        assert.ok(typeof amount === 'string' || BN.isBN(amount))
        assert.ok(typeof decimals === 'number' && decimals >= 0 && decimals < CURRENCY_DIVIDERS.length)
        const amountPrepared = typeof amount === 'string' ? Utils.toBN(amount) : amount
        return Web3.utils.fromWei(amountPrepared.mul(CURRENCY_DIVIDERS[decimals]), 'tether').toString()
    }

    /**
     * Converts human readable amount of currency to BigNumber amount of it's atomic parts.
     * For example: currencyFloatToAtomic(1.75, 18) will return value 1750000000000000000 as BigNumber.
     * @param {(string|number|BN)} amount Human readable amount of currency.
     * @param {number} decimals Amount of decimals of a currency.
     * @returns {BN} Amount of atomic parts of a currency.
     * @static
     */
    static currencyFloatToAtomic(amount, decimals) {
        assert.ok(typeof amount === 'number' || typeof amount === 'string' || BN.isBN(amount))
        assert.ok(typeof decimals === 'number' && decimals >= 0 && decimals < CURRENCY_DIVIDERS.length)
        const amountPrepared = typeof amount === 'number' ? amount.toString() : amount
        return Utils.toBN(Web3.utils.toWei(amountPrepared, 'tether')).div(CURRENCY_DIVIDERS[decimals])
    }

    /**
     * Converts Ethereum address to be checksummed.
     * @param {string} address Ethereum address started with '0x'.
     * @returns {string} Ethereum checksummed address.
     * @static
     */
    static toChecksumEthereumAddress(address) {
        assert.ok(Utils.validateEthereumAddressString(address))
        return Web3.utils.toChecksumAddress(address)
    }

    /**
     * Converts Ethereum address presented as Buffer or string started with '0x' to Buffer.
     * @param {Buffer|string} address Ethereum address which should be converted to Buffer.
     * @returns {Buffer} Ethereum address presented as Buffer (20 bytes length).
     * @static
     */
    static toEthereumAddressBuffer(address) {
        if (Utils.validateEthereumAddressBuffer(address)) {
            return address
        } else if (Utils.validateEthereumAddressString(address)) {
            return Buffer.from(address.slice(2), 'hex')
        }
        assert.fail()
        return ZERO_ETHEREUM_ADDRESS_BUFFER
    }

    /**
     * Compares Ethereum addresses presented as Buffers or strings started with '0x'.
     * @param {Buffer|string} addressA First Ethereum address to compare.
     * @param {Buffer|string} addressB Second Ethereum address to compare.
     * @returns {Buffer} Ethereum address presented as Buffer (20 bytes length).
     * @static
     */
    static areEthereumAddressesEqual(addressA, addressB) {
        const emptyAddressA = !addressA ||
            (addressA instanceof Buffer && Buffer.compare(addressA, ZERO_ETHEREUM_ADDRESS_BUFFER) === 0) ||
            (typeof addressA === 'string' && addressA.length === 42 && addressA === ZERO_ETHEREUM_ADDRESS_HEX)
        const emptyAddressB = !addressB ||
            (addressB instanceof Buffer && Buffer.compare(addressB, ZERO_ETHEREUM_ADDRESS_BUFFER) === 0) ||
            (typeof addressB === 'string' && addressB.length === 42 && addressB === ZERO_ETHEREUM_ADDRESS_HEX)
        if (emptyAddressA && emptyAddressB) {
            return true
        } else if (!emptyAddressA && !emptyAddressB) {
            if (typeof addressA === typeof addressB === 'string') {
                return addressA.toLocaleLowerCase() === addressB.toLocaleLowerCase()
            } else if (addressA instanceof Buffer && addressB instanceof Buffer) {
                return Buffer.compare(addressA, addressB) === 0
            } else {
                return Buffer.compare(Utils.toEthereumAddressBuffer(addressA), Utils.toEthereumAddressBuffer(addressB)) === 0
            }
        }
        return false
    }

    /**
     * Checks if address is valid Ethereum address presented as Buffer or string started with '0x'.
     * @param {Buffer|string} address Ethereum address which should be checked.
     * @returns {boolean} True if address is valid Ethereum address.
     * @static
     */
    static validateEthereumAddress(address) {
        return Utils.validateEthereumAddressBuffer(address) || Utils.validateEthereumAddressString(address)
    }

    /**
     * Checks if address is valid Ethereum address presented as Buffer.
     * @param {Buffer} address Ethereum address which should be checked.
     * @returns {boolean} True if address is valid Ethereum address.
     * @static
     */
    static validateEthereumAddressBuffer(address) {
        return address && address instanceof Buffer && address.length === 20
    }

    /**
     * Checks if address is valid Ethereum address as string started with '0x'.
     * @param {string} address Address which should be checked.
     * @returns {boolean} True if address is valid Ethereum address.
     * @static
     */
    static validateEthereumAddressString(address) {
        return address && typeof address === 'string' && /^0[xX][A-Fa-f0-9]{40}$/.test(address)
    }

    /**
     * Checks if value is hexadecimal integral number and has '0x' at the start (can also contain '-' at the start).
     * @param {string} value Value which should be checked.
     * @returns {boolean} True if value is hexadecimal integral number and can be converted to BigNumber safely.
     * @static
     */
    static isHexadecimalIntegralNumber(value) {
        return typeof value === 'string' && /^-?0[xX][0-9a-fA-F]*$/.test(value)
    }

    /**
     * Checks if value is decimal integral number (can also contain '-' at the start).
     * @param {(string|number|BN)} value Number, string or BigInteger which should be checked.
     * @returns {boolean} True if value is decimal integral number and can be converted to BigNumber safely.
     * @static
     */
    static isDecimalIntegralNumber(value) {
        const type = typeof value
        if (type === 'number') {
            return Number.isInteger(value)
        } else if (type === 'string') {
            return /^-?[0-9]*$/.test(value)
        } else if (BN.isBN(value)) {
            return true
        }
        return false
    }

    /**
     * Checks if value is BigNumber presenting int256 value.
     * @param {BN} value BigNumber value which should be checked.
     * @returns {boolean} True if value is BigNumber presenting int256 value.
     * @static
     */
    static isInt256BN(value) {
        return BN.isBN(value) && value.gte(MIN_INT256_BN) && value.lte(MAX_INT256_BN)
    }

    /**
     * Checks if value is BigNumber presenting uint256 value.
     * @param {BN} value BigNumber value which should be checked.
     * @returns {boolean} True if value is BigNumber presenting uint256 value.
     * @static
     */
    static isUint256BN(value) {
        return BN.isBN(value) && value.gte(ZERO_BN) && value.lte(MAX_UINT256_BN)
    }
    
    /**
     * Returns promise which will be resolved with specified delay.
     * @param {number} ms Amount of milliseconds to wait before resolve a promise.
     * @returns {Promise} Promise which will be resolved with specified delay.
     * @static
     */
    static sleepPromise(ms) {
        return new Promise(resolve => {
            if (ms > 0) {
                setTimeout(() => {
                    resolve()
                }, ms)
            } else {
                resolve()
            }
        })
    }

    /**
     * Compiles connection string to QTUM node using specified options.
     * @param {Object} options QTUM connection options as Object.
     * @param {string} options.address Address to connect.
     * @param {string} options.port Port to connect.
     * @param {string} options.username Username used to authorize connection.
     * @param {string} options.passsword Password used to authorize connection.
     * @returns {string} Connection string to QTUM node.
     */
    static getQtumConnection(options) {
        return options.username && options.password ?
            `http://${options.username}:${options.password}@${options.address}:${options.port}` :
            `http://${options.address}:${options.port}`
    }
}

module.exports = Utils
