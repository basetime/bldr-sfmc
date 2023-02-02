const crypto = require('crypto');
const keytar = require('keytar-sync');
const algorithm = 'aes-256-ctr';

//TODO split encryption to separate pkg

module.exports = class Encryption {
    /**
     * Encrypt string with aes-256-gcm
     * @param {string} text
     * @return {string}
     */
    async encrypt(text) {
        // Instantiates a client
        const iv = crypto.randomBytes(16);
        const ENCODE = await keytar.getPassword('bldr', 'io');
        const SALT = await keytar.getPassword('bldr', 'salty');

        if (!ENCODE || !SALT) {
            throw new Error('Encryption key or Salt not found');
        }

        const cipher = crypto.createCipheriv(algorithm, ENCODE, iv);
        const encrypted = Buffer.concat([cipher.update(`${text}${SALT}`), cipher.final()]);
        return `${iv.toString('hex')}@|@${encrypted.toString('hex')}`;
    }

    /**
     * Decrypt string with aes-256-gcm
     * @param {string} hash
     * @return {string}
     */
    async decrypt(hash) {
        const ENCODE = await keytar.getPassword('bldr', 'io');
        const SALT = await keytar.getPassword('bldr', 'salty');

        const parts = hash.split('@|@');
        const decipher = crypto.createDecipheriv(algorithm, ENCODE, Buffer.from(parts[0], 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
        let decryptedStr = decrypted.toString();
        return decryptedStr.substring(0, decryptedStr.length - SALT.length);
    }

    async envFile() {
        let envExists = await keytar.getPassword('bldr', 'io');

        if (!envExists) {
            const hex = await this.#generateHexString(32);
            const salt = await this.#generateHexString(12);
            await keytar.setPassword('bldr', 'io', hex);
            await keytar.setPassword('bldr', 'salty', salt);
        }
    }

    #generateHexString(length) {
        // Use crypto.getRandomValues if available
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
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
