const SFMC = require('../utils/SFMC/lib/index');
const utils = require('../utils/utils');
const Column = require('./help/Column');
const display = require('./displayStyles');
const Encryption = require('./Encryption');
const Config = require('./Blueprint/Config');
const { styles, width } = display.init();
const crypto = new Encryption();
const config = new Config();

module.exports.init = async (mid, store) => {
    try {
        const state = utils.assignObject(store.state.get());
        const instance = state.instance;
        const configurationObject = utils.assignObject(
            store.config.get(instance)
            );
            const accountId = mid || state.activeMID || state.parentMID;


        if(!configurationObject.apiClientId.includes('@|@') || !configurationObject.apiClientSecret.includes('@|@')){
          throw new Error(`Configuration for ${instance} needs to be updated. Please run 'bldr config --encrypt'`)
        }

        return new SFMC(
            {
                client_id: crypto.decrypt(configurationObject.apiClientId),
                client_secret: crypto.decrypt(configurationObject.apiClientSecret),
                auth_url: configurationObject.authURI,
                account_id: Number(accountId),
            },
            {
                eventHandlers: {
                    onConnectionError: (ex, remainingAttempts) =>
                        console.log(ex.code, remainingAttempts),
                },
                requestAttempts: 1,
                retryOnConnectionError: true,
            }
        );
    } catch (err) {
        const displayHeader = [
            new Column(
                `${styles.error('SFMC API Authentication Error')}`,
                width.c3
            ),
        ];
        const displayContent = [[new Column(err.message, width.c3)]];

        display.render(displayHeader, displayContent);
    }
};
