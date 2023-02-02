//TODO write process to migrate from local storage to keytar process
//TODO once confirmed that all keys have been migrated remove encryption key and config files from local
const crypto = require('crypto');
const Encryption = require('../../Encryption');
const store = require('../../Store');
const algorithm = 'aes-256-ctr';
const keytar = require('keytar-sync');
const updatedCrypto = new Encryption();
const { unlink } = require('node:fs/promises');

const ENCODE = Object.assign({}, store.env.get()).encode;
const savedConfigurations = Object.assign({}, store.config.get());

const isEmpty = (obj) => Object.keys(obj).length === 0;

/**
 * Decrypt string with aes-256-gcm
 * @param {string} hash
 * @return {string}
 */
const decryptExisting = async (hash) => {
    const parts = hash.split('@|@');
    const decipher = crypto.createDecipheriv(algorithm, ENCODE, Buffer.from(parts[0], 'hex'));
    const decrypted = Buffer.concat([decipher.update(Buffer.from(parts[1], 'hex')), decipher.final()]);
    let decryptedStr = decrypted.toString();
    return decryptedStr;
};

module.exports.migrate = async () => {
    if (isEmpty(savedConfigurations)) {
        console.log('No configurations to migrate');
        return;
    }

    await updatedCrypto.envFile();

    for (const s in savedConfigurations) {
        const account = s;
        let configuration = savedConfigurations[s];

        configuration.apiClientId = await decryptExisting(configuration.apiClientId);
        configuration.apiClientSecret = await decryptExisting(configuration.apiClientSecret);

        configuration.apiClientId = await updatedCrypto.encrypt(configuration.apiClientId);
        configuration.apiClientSecret = await updatedCrypto.encrypt(configuration.apiClientSecret);

        await keytar.setPassword('bldr', account, JSON.stringify(configuration));
        let setPsw = await keytar.getPassword('bldr', account);

        if (setPsw) {
            console.log(`${account}: Migrated successfully`);
            await store.config.delete(account);

            let checkConfig = Object.assign({}, store.config.get());
            if (isEmpty(checkConfig)) {
                await unlink(store.config.path);
                await unlink(store.env.path);
                console.log('Removed unused configuration files');
            }
        } else {
            console.log(`${account}: There was an error with migration. Please reconfigure using [bldr config -n].`);
        }
    }
};
