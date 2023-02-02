"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Crypto = void 0;
const crypto = require('crypto');
const keytar_sync_1 = require("keytar-sync");
const algorithm = 'aes-256-ctr';
class Crypto {
    constructor() {
        /**
         * Generate encryption hex keys
         *
         * @param length
         * @returns
         */
        this.generateHexString = (length) => {
            //Use crypto.getRandomValues if available
            if (typeof crypto.getRandomValues === 'function') {
                var tmp = new Uint8Array(Math.max(~~length / 2));
                crypto.getRandomValues(tmp);
                return Array.from(tmp)
                    .map((n) => ('0' + n.toString(16)).substring(-2))
                    .join('')
                    .substring(0, length);
            }
            // fallback to Math.getRandomValues
            var ret = '';
            while (ret.length < length) {
                ret += Math.random().toString(16).substring(2);
            }
            return ret.substring(0, length);
        };
        /**
         * Create required entries for bldr's encryption
         */
        this.setEncryption = () => __awaiter(this, void 0, void 0, function* () {
            let envExists = yield (0, keytar_sync_1.getPassword)('bldr', 'io');
            if (!envExists) {
                const hex = yield this.generateHexString(32);
                const salt = yield this.generateHexString(12);
                yield (0, keytar_sync_1.setPassword)('bldr', 'io', hex);
                yield (0, keytar_sync_1.setPassword)('bldr', 'salty', salt);
            }
        });
    }
    /**
     * Encrypt string with aes-256-gcm
     *
     * @param {string} text
     * @return {string}
     */
    encrypt(text) {
        return __awaiter(this, void 0, void 0, function* () {
            // Instantiates a client
            const iv = crypto.randomBytes(16);
            const ENCODE = yield (0, keytar_sync_1.getPassword)('bldr', 'io');
            const SALT = yield (0, keytar_sync_1.getPassword)('bldr', 'salty');
            if (!ENCODE || !SALT) {
                throw new Error('Encryption key or Salt not found');
            }
            const cipher = crypto.createCipheriv(algorithm, ENCODE, iv);
            const encrypted = Buffer.concat([cipher.update(`${text}${SALT}`), cipher.final()]);
            return `${iv.toString('hex')}@|@${encrypted.toString('hex')}`;
        });
    }
    /**
     * Decrypt string with aes-256-gcm
     * @param {string} hash
     * @return {string}
     */
    decrypt(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const ENCODE = (yield (0, keytar_sync_1.getPassword)('bldr', 'io')) || '';
            const SALT = (yield (0, keytar_sync_1.getPassword)('bldr', 'salty')) || '';
            const parts = hash.split('@|@');
            const decipher = crypto.createDecipheriv(algorithm, ENCODE, Buffer.from(parts[0], 'hex'));
            const decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
            let decryptedStr = decrypted.toString();
            return decryptedStr.substring(0, decryptedStr.length - SALT.length);
        });
    }
}
exports.Crypto = Crypto;
