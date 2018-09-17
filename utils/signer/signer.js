const crypto = require('./crypto')

const Messenger = require('./messenger')
const messenger = new Messenger()

/**
 * Signs serialized message using specified private key.
 * @param {string} serializedMessage Prepared to sign serialized message as string in hex format without starting '0x'.
 * @param {Buffer} privateKey Private key which should be used to sign.
 * @returns {string} Returns packed signed message ready to send to a L2 server.
 */
function signSerializedMessage(serializedMessage, privateKey, qtum) {
    const signerBuffer = qtum ? crypto.ethereumAddressForQtumFromPrivateKey(privateKey) : crypto.ethereumAddressFromPrivateKey(privateKey)
    const serializedMessageBuffer = Buffer.from(serializedMessage, 'hex')
    const signedMessage = crypto.ecSignData(serializedMessageBuffer, privateKey)
    const packedSignedMessage = messenger.packSignedMessage(serializedMessageBuffer, signerBuffer, signedMessage)
    return packedSignedMessage.toString('hex')
}

module.exports = signSerializedMessage
