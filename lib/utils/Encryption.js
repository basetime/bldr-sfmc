const LocalFile = require('./Blueprint/LocalFile');
const localFile = new LocalFile();

const crypto = require('crypto');
const fs = require('fs');

const algorithm = 'aes-256-ctr';
const filePath = __dirname;
const dirPath = filePath.slice(0, filePath.indexOf('lib/utils'));

module.exports = class Encryption {
    /**
     * Encrypt string with aes-256-gcm
     * @param {string} text
     * @return {string}
     */
    encrypt(text) {
        const dotenv = require('dotenv').config({ path: `${dirPath}.env` });
        const ENCODE = process.env.ENCODE;

        if (!ENCODE) {
            throw new Error('ENCODE not defined.');
        }

        // Instantiates a client
        const iv = crypto.randomBytes(16);

        const cipher = crypto.createCipheriv(algorithm, ENCODE, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return `${iv.toString('hex')}@|@${encrypted.toString('hex')}`;
    }
    /**
     * Decrypt string with aes-256-gcm
     * @param {string} hash
     * @return {string}
     */
    decrypt(hash) {
        const dotenv = require('dotenv').config({ path: `${dirPath}.env` });
        const ENCODE = process.env.ENCODE;

        if (!ENCODE) {
            throw new Error('ENCODE not defined.');
        }
        const parts = hash.split('@|@');
        const decipher = crypto.createDecipheriv(
            algorithm,
            ENCODE,
            Buffer.from(parts[0], 'hex')
        );
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(parts[1], 'hex')),
            decipher.final(),
        ]);
        return decrypted.toString();
    }

    async envFile() {
        if (!fs.existsSync(`${dirPath}.env`)) {
            const hex = await this.#generateHexString(32);
            await fs.writeFileSync(`${dirPath}.env`, `ENCODE=${hex}`);
        }
    }

    #generateHexString(length) {
        // Use crypto.getRandomValues if available
        if (
            typeof crypto !== 'undefined' &&
            typeof crypto.getRandomValues === 'function'
        ) {
            var tmp = new Uint8Array(Math.max(~~length / 2));
            crypto.getRandomValues(tmp);
            return Array.from(tmp)
                .map((n) => ('0' + n.toString(16)).substr(-2))
                .join('')
                .substr(0, length);
        }

        // fallback to Math.getRandomValues
        var ret = '';
        while (ret.length < length) {
            ret += Math.random().toString(16).substring(2);
        }
        return ret.substring(0, length);
    }
};
