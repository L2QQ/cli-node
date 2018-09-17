const assert = require('assert')
const secp256k1 = require('secp256k1')
const ethUtil = require('ethereumjs-util')
const wif = require('wif')
const bs58 = require('bs58')
const qtumCore = require('qtumcore-lib')


/** Class implementing common cryptography. */
class Crypto {

    /////////////////////////////////////////////////////////
    // Hash functions
    /////////////////////////////////////////////////////////

    /**
     * Calculates SHA-256 hash.
     * @param {Buffer} data Data which should be hashed.
     * @returns {Buffer} Hash of the specified data.
     * @static
     */
    static sha256(data) {
        assert.ok(data instanceof Buffer)
        return ethUtil.sha256(data)
    }

    /**
     * Calculates Ethereum-SHA-3 (Keccak-256) hash.
     * @param {Buffer} data Data which should be hashed.
     * @returns {Buffer} Hash of the specified data.
     * @static
     */
    static keccak256(data) {
        assert.ok(data instanceof Buffer)
        return ethUtil.sha3(data)
    }

    /**
     * Calculates RIPEMD-160 hash.
     * @param {Buffer} data Data which should be hashed.
     * @returns {Buffer} Hash of the specified data.
     * @static
     */
    static ripemd160(data) {
        assert.ok(data instanceof Buffer)
        return ethUtil.ripemd160(data)
    }

    /////////////////////////////////////////////////////////
    // Elliptic Curve functions
    /////////////////////////////////////////////////////////

    /**
     * Calculates public key from a private key.
     * @param {Buffer} privateKey Private key (32 bytes length).
     * @param {boolean} [compressed=false] Flag indicating should be public key in compressed or uncompressed format.
     * @returns {Buffer} Public key in compressed (33 bytes length) or uncompressed (65 bytes length) format.
     * @static
     */
    static publicKeyFromPrivateKey(privateKey, compressed = false) {
        assert.ok(privateKey instanceof Buffer && privateKey.length === 32)
        return secp256k1.publicKeyCreate(privateKey, compressed)
    }

    /**
     * Signs data with specified private key (data firstly hashed using Keccak-256).
     * @param {Buffer} data Data which should be signed.
     * @param {Buffer} privateKey Private key which should be used for signing (32 bytes length).
     * @returns {Object} Object in format { dataHash, v, r, s }.
     * @static
     */
    static ecSignData(data, privateKey) {
        assert.ok(data instanceof Buffer)
        assert.ok(privateKey instanceof Buffer && privateKey.length === 32)
        const dataHash = Crypto.keccak256(data)
        return Object.assign({ data }, Crypto.ecSignHash(dataHash, privateKey))
    }

    /**
     * Signs data hash with specified private key.
     * @param {Buffer} dataHash Data hash which should be signed.
     * @param {Buffer} privateKey Private key which should be used for signing (32 bytes length).
     * @returns {Object} Object in format { dataHash, v, r, s }.
     * @static
     */
    static ecSignHash(dataHash, privateKey) {
        assert.ok(dataHash instanceof Buffer && dataHash.length === 32)
        assert.ok(privateKey instanceof Buffer && privateKey.length === 32)
        const signature = secp256k1.sign(dataHash, privateKey)
        return {
            dataHash: dataHash,
            v: signature.recovery + 27,
            r: signature.signature.slice(0, 32),
            s: signature.signature.slice(32, 64)
        }
    }

    /**
     * Recovers public key from data and signature (data firstly hashed using Keccak-256).
     * @param {Buffer} data Signed data.
     * @param {number} v Recovery value of the signature in range [27; 30].
     * @param {Buffer} r First part of the signature (32 bytes length).
     * @param {Buffer} s Second part of the signature (32 bytes length).
     * @param {boolean} [compressed=false] Flag indicating should be public key in compressed or uncompressed format.
     * @returns {Buffer} Public key in compressed (33 bytes length) or uncompressed (65 bytes length) format.
     * @static
     */
    static ecRecoverFromData(data, v, r, s, compressed = false) {
        assert.ok(data instanceof Buffer)
        assert.ok(typeof v === 'number' && v >= 27 && v <= 30)
        assert.ok(r instanceof Buffer && r.length === 32)
        assert.ok(s instanceof Buffer && s.length === 32)
        const dataHash = Crypto.keccak256(data)
        return Crypto.ecRecoverFromHash(dataHash, v, r, s, compressed)
    }

    /**
     * Recovers public key from data hash and signature.
     * @param {Buffer} dataHash Signed data hash.
     * @param {number} v Recovery value of the signature in range [27; 30].
     * @param {Buffer} r First part of the signature (32 bytes length).
     * @param {Buffer} s Second part of the signature (32 bytes length).
     * @param {boolean} [compressed=false] Flag indicating should be public key in compressed or uncompressed format.
     * @returns {Buffer} Public key in compressed (33 bytes length) or uncompressed (65 bytes length) format.
     * @static
     */
    static ecRecoverFromHash(dataHash, v, r, s, compressed = false) {
        assert.ok(dataHash instanceof Buffer && dataHash.length === 32)
        assert.ok(typeof v === 'number' && v >= 27 && v <= 30)
        assert.ok(r instanceof Buffer && r.length === 32)
        assert.ok(s instanceof Buffer && s.length === 32)
        return secp256k1.recover(dataHash, Buffer.concat([ r, s ]), v - 27, compressed)
    }

    /////////////////////////////////////////////////////////
    // Ethereum related functions
    /////////////////////////////////////////////////////////

    /**
     * Calculates Ethereum address from a private key.
     * @param {Buffer} privateKey Private key (32 bytes length).
     * @returns {Buffer} Ethereum address as Buffer (20 bytes length).
     * @static
     */
    static ethereumAddressFromPrivateKey(privateKey) {
        assert.ok(privateKey instanceof Buffer && privateKey.length === 32)
        const publicKey = Crypto.publicKeyFromPrivateKey(privateKey, false)
        return Crypto.ethereumAddressFromPublicKey(publicKey)
    }

    /**
     * Calculates Ethereum address from a public key.
     * @param {Buffer} publicKey Public key in uncompressed format (64 or 65 bytes length).
     * @returns {Buffer} Ethereum address as Buffer (20 bytes length).
     * @static
     */
    static ethereumAddressFromPublicKey(publicKey) {
        assert.ok(publicKey instanceof Buffer)
        assert.ok(publicKey.length === 64 || publicKey.length === 65)
        const publicKeyPrepared = publicKey.length === 65 ? publicKey.slice(1) : publicKey
        const addressBuffer = Crypto.keccak256(publicKeyPrepared).slice(-20)
        return addressBuffer
    }

    /////////////////////////////////////////////////////////
    // QTUM related functions
    /////////////////////////////////////////////////////////

    /**
     * Calculates Ethereum address from a private key (using algorithm used in QTUM). 
     * @param {Buffer} privateKey Public key (33, 64 or 65 bytes length).
     * @returns {Buffer} Ethereum address as Buffer (20 bytes length).
     * @static
     */
    static ethereumAddressForQtumFromPrivateKey(privateKey) {
        assert.ok(privateKey instanceof Buffer && privateKey.length === 32)
        const publicKey = Crypto.publicKeyFromPrivateKey(privateKey, true)
        return Crypto.ethereumAddressForQtumFromPublicKey(publicKey)
    }

    /**
     * Calculates Ethereum address from a public key (using algorithm used in QTUM). 
     * @param {Buffer} publicKey Public key (33, 64 or 65 bytes length).
     * @returns {Buffer} Ethereum address as Buffer (20 bytes length).
     * @static
     */
    static ethereumAddressForQtumFromPublicKey(publicKey) {
        assert.ok(publicKey instanceof Buffer)
        assert.ok(publicKey.length === 33 || publicKey.length === 64 || publicKey.length === 65)
        let publicKeyPrepared = publicKey
        if (publicKey.length === 64) {
            publicKeyPrepared = Buffer.concat([ (publicKey[63] % 2) + 2, publicKey.slice(0, 32) ])
        } else if (publicKey.length === 65) {
            publicKeyPrepared = Buffer.concat([ (publicKey[64] % 2) + 2, publicKey.slice(1, 33) ])
        }
        const publicKeyHash = Crypto.sha256(publicKeyPrepared)
        const addressBuffer = Crypto.ripemd160(publicKeyHash)
        return addressBuffer
    }

    /**
     * Calculates WIF private key from binary private key.
     * @param {Buffer} privateKey Private key (32 bytes length).
     * @returns {string} QTUM private key in WIF.
     * @static
     */
    static qtumWifFromPrivateKey(privateKey) {
        assert.ok(privateKey instanceof Buffer && privateKey.length == 32)
        return wif.encode(239, privateKey, true)
    }

    /**
     * Calculates binary private key from WIF private key.
     * @param {string} privateKeyWif Private key encoded in WIF.
     * @returns {Buffer} QTUM private key in binary format (32 bytes length).
     * @static
     */
    static qtumPrivateKeyFromWif(privateKeyWif) {
        assert.ok(typeof privateKeyWif === 'string')
        return wif.decode(privateKeyWif).privateKey
    }

    /**
     * Calculates QTUM address from WIF private key.
     * @param {string} privateKeyWif Private key encoded in WIF.
     * @param {boolean} testnet Flag indication if QTUM address should be calculated for test network.
     * @returns {string} QTUM address.
     * @static
     */
    static qtumAddressFromWif(privateKeyWif, testnet) {
        assert.ok(typeof privateKeyWif === 'string')
        const qtumNetwork = testnet ? qtumCore.Networks.testnet : qtumCore.Networks.mainnet
        return new qtumCore.PrivateKey(privateKeyWif, qtumNetwork).toAddress(qtumNetwork)
    }

    /**
     * Converts QTUM address to Ethereum address (using algorithm used in QTUM).
     * @param {string} addressQtum QTUM address.
     * @returns {Buffer} Ethereum address as Buffer (20 bytes length).
     * @static
     */
    static qtumAddressToEthereumAddress(addressQtum) {
        assert.ok(typeof addressQtum === 'string')
        const addressBuffer = bs58.decode(addressQtum).slice(1, 21)
        return addressBuffer
    }
}

module.exports = Crypto
