const SFMC = require('../utils/SFMC/lib/index');
const utils = require('../utils/utils');
const Column = require('./help/Column');
const display = require('./displayStyles');
const Encryption = require('./Encryption');
const { styles, width } = display.init();
const crypto = new Encryption();
const keytar = require('keytar-sync');

module.exports.init = async (mid, store) => {
    try {
        const state = utils.assignObject(store.state.get());
        const instance = state.instance;

        if (!instance) {
            throw new Error('Unable to find set instance');
        }

        const getConfiguration = await keytar.getPasswordSync('bldr', instance);

        if (!getConfiguration) {
            throw new Error(`Unable to find set Configuration for ${instance}`);
        }

        const configurationObject = JSON.parse(getConfiguration);
        const accountId = mid || state.activeMID || state.parentMID;

        if (!configurationObject.apiClientId.includes('@|@') || !configurationObject.apiClientSecret.includes('@|@')) {
            throw new Error(`Configuration for ${instance} needs to be updated. Please run 'bldr config --encrypt'`);
        }

        return new SFMC(
            {
                client_id: await crypto.decrypt(configurationObject.apiClientId),
                client_secret: await crypto.decrypt(configurationObject.apiClientSecret),
                auth_url: configurationObject.authURI,
                account_id: Number(accountId),
            },
            {
                eventHandlers: {
                    onConnectionError: (ex, remainingAttempts) => console.log(ex.code, remainingAttempts),
                },
                requestAttempts: 1,
                retryOnConnectionError: true,
            }
        );
    } catch (err) {
        const displayHeader = [new Column(`${styles.error('SFMC API Authentication Error')}`, width.c3)];
        const displayContent = [[new Column(err.message, width.c3)]];

        display.render(displayHeader, displayContent);
    }
};
