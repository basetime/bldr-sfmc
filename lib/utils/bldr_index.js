const SFMC = require('sfmc-api-wrapper');
const utils = require('../utils/utils');

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
        console.log(err);
        console.log('Authentication Error');
    }
};
