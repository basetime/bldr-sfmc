const SFMC = require('../utils/SFMC/lib/index');
const utils = require('../utils/utils');
const Column = require('./help/Column');
const display = require('./displayStyles');
const { styles, width } = display.init();

module.exports.init = (mid, store) => {
    try {
        const state = utils.assignObject(store.state.get());
        const instance = state.instance;
        const configurationObject = utils.assignObject(
            store.config.get(instance)
        );
        const accountId = mid || state.activeMid || state.parentMID;

        return new SFMC(
            {
                client_id: configurationObject.apiClientId,
                client_secret: configurationObject.apiClientSecret,
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
