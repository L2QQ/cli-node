const assert = require('assert')

const utils = require('./utils')

const ZERO_ADDRESS_BUFFER = Buffer.alloc(20)


class Messenger {

    /////////////////////////////////////////////////////////
    // Update channel message
    /////////////////////////////////////////////////////////

    /**
     * Serializes update channel message ready to sign.
     * @param {Buffer|string} channelOwner Ethereum address of channel owner as Buffer or as string starting with '0x'.
     * @param {Buffer|string} token Ethereum address of ERC20/QRC20 token smart contract as Buffer or as string starting with '0x' (can be null).
     * @param {(string|number|BN)} change Channel balance change in atomic parts of a currency.
     * @param {(string|number|BN)} nonce Index of transaction inside a channel.
     * @param {boolean} [apply=false] Flag indicating if channel balance change should be applied (used only when signed by contract owner).
     * @param {(string|number|BN)} [free=0] Amount of currency that should be allowed to withdraw by channel owner (used only when signed by contract owner).
     * @returns {Buffer} Serialized update channel message ready to sign.
     */
    serializeMessageUC(channelOwner, token, change, nonce, apply = false, free = 0) {
        assert.ok(this.validateMessageUC({ channelOwner, token, change, nonce, apply, free }))
        const channelOwnerBuffer = utils.toEthereumAddressBuffer(channelOwner)
        const tokenBuffer = token ? utils.toEthereumAddressBuffer(token) : ZERO_ADDRESS_BUFFER
        const changeBuffer = utils.int256ToBuffer(utils.int256FromNumber(change))
        const nonceBuffer = utils.int256ToBuffer(utils.toBN(nonce))
        const applyBuffer = Buffer.from([ apply ? 1 : 0 ])
        const freeBuffer = utils.int256ToBuffer(utils.toBN(free))
        return Buffer.concat([ channelOwnerBuffer, tokenBuffer, changeBuffer, nonceBuffer, applyBuffer, freeBuffer ])
    }

    /**
     * Deserializes update channel message to it's initial values.
     * @param {Buffer} serializedMessage Serialized update channel message.
     * @returns {Object} Update channel message as object containing deserialized values as Buffers.
     */
    deserializeMessageUC(serializedMessage) {
        assert.ok(this.validateSerializedMessageUC(serializedMessage))
        const channelOwner = serializedMessage.slice(0, 20)
        const token = serializedMessage.slice(20, 40)
        const change = serializedMessage.slice(40, 72)
        const nonce = serializedMessage.slice(72, 104)
        const apply = serializedMessage[104] !== 0
        const free = serializedMessage.slice(105, 137)
        return { channelOwner, token, change, nonce, apply, free }
    }

    /**
     * Validates update channel message.
     * @param {Object} message Update channel message.
     * @returns {boolean} Flag indicating if update channel message is valid.
     */
    validateMessageUC(message) {
        const channelOwnerValid = utils.validateEthereumAddress(message.channelOwner)
        const tokenValid = !message.token || utils.validateEthereumAddress(message.token)
        const changeValid = utils.isDecimalIntegralNumber(message.change) && utils.isInt256BN(utils.toBN(message.change))
        const nonceValid = utils.isDecimalIntegralNumber(message.nonce) && utils.isUint256BN(utils.toBN(message.nonce))
        const freeValid = utils.isDecimalIntegralNumber(message.free) && utils.isUint256BN(utils.toBN(message.free))
        return channelOwnerValid && tokenValid && changeValid && nonceValid && freeValid
    }

    /**
     * Validates update channel serialized message.
     * @param {Buffer} serializedMessage Serialized update channel message.
     * @returns {boolean} Flag indication if update channel serialized message is valid.
     */
    validateSerializedMessageUC(serializedMessage) {
        return serializedMessage && serializedMessage instanceof Buffer && serializedMessage.length === 137
    }

    /////////////////////////////////////////////////////////
    // Packing/unpacking
    /////////////////////////////////////////////////////////

    /**
     * Packs message, signer address and signature to single buffer.
     * @param {Buffer} message Message signed by the signer.
     * @param {Buffer} signer Ethereum address of the signer.
     * @param {Object} signature Signature of the message.
     * @param {number} signature.v Recovery value of the signature (should be in range [27; 30]).
     * @param {Buffer} signature.r First part of the signature (32 bytes length EC point X).
     * @param {Buffer} signature.s Second part of the signature (32 bytes length EC point Y).
     * @returns {Buffer} Packed message, signer address and signature.
     */
    packSignedMessage(message, signer, signature) {
        assert.ok(message instanceof Buffer)
        assert.ok(signer instanceof Buffer && signer.length === 20)
        assert.ok(typeof signature.v === 'number' && signature.v >= 27 && signature.v <= 30)
        assert.ok(signature.r instanceof Buffer && signature.r.length === 32)
        assert.ok(signature.s instanceof Buffer && signature.s.length === 32)
        return Buffer.concat([
            message,
            signer,
            Buffer.from([ signature.v ]),
            signature.r,
            signature.s
        ])
    }

    /**
     * Unpacks single buffer to message, signer address and signature.
     * @param {Buffer} packedSignedMessage Packed message, signer address and signature.
     * @returns {Object} Object containing message, signer address and signature.
     */
    unpackSignedMessage(packedSignedMessage) {
        assert.ok(packedSignedMessage instanceof Buffer && packedSignedMessage.length >= 85)
        const messageLength = packedSignedMessage.length - 85
        return {
            message: packedSignedMessage.slice(0, messageLength),
            signer: packedSignedMessage.slice(messageLength, messageLength + 20),
            signature: {
                v: packedSignedMessage[messageLength + 20],
                r: packedSignedMessage.slice(messageLength + 21, messageLength + 53),
                s: packedSignedMessage.slice(messageLength + 53, messageLength + 85)
            }
        }
    }
}

module.exports = Messenger
