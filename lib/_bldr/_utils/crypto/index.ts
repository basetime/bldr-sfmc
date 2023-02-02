const crypto = require('crypto');
import { getPassword, setPassword } from 'keytar-sync';

const algorithm = 'aes-256-ctr';

export class Crypto {
    /**
     * Encrypt string with aes-256-gcm
     *
     * @param {string} text
     * @return {string}
     */
    async encrypt(text: string): Promise<string> {
        // Instantiates a client
        const iv = crypto.randomBytes(16);
        const ENCODE = await getPassword('bldr', 'io');
        const SALT = await getPassword('bldr', 'salty');

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
    async decrypt(hash: string): Promise<string> {
        const ENCODE = (await getPassword('bldr', 'io')) || '';
        const SALT = (await getPassword('bldr', 'salty')) || '';

        const parts = hash.split('@|@');
        const decipher = crypto.createDecipheriv(algorithm, ENCODE, Buffer.from(parts[0], 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
        let decryptedStr = decrypted.toString();
        return decryptedStr.substring(0, decryptedStr.length - SALT.length);
    }

    /**
     * Generate encryption hex keys
     *
     * @param length
     * @returns
     */
    generateHexString = (length: number) => {
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
    setEncryption = async () => {
        let envExists = await getPassword('bldr', 'io');

        if (!envExists) {
            const hex = await this.generateHexString(32);
            const salt = await this.generateHexString(12);
            await setPassword('bldr', 'io', hex);
            await setPassword('bldr', 'salty', salt);
        }
    };
}
