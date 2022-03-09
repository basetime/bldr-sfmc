const SDK = require('sfmc-sdk');
const config = require('../../config/init')
const state = require('../../state/init')

module.exports.setAuth = async (mid) => {
    const stateJSON = await state.getState();
    const instance = stateJSON.instance;
    const client = config.getConfiguration(instance)

    const sfmc = new SDK({
            client_id: client.apiClientId,
            client_secret: client.apiClientSecret,
            auth_url: `https://${client.instanceSubdomain}.auth.marketingcloudapis.com/`,
            account_id: mid ? Number(mid) : Number(client.parentMID),
        },
        {
            eventHandlers: {
                onLoop: (type, accumulator) => console.log('Looping', type, accumlator.length),
                // onRefresh: (options) => console.log('RefreshingToken.', Options),
                // logRequest: (req) => console.log(req),
                // logResponse: (res) => console.log(res),
                onConnectionError: (ex, remainingAttempts) => console.log(ex.code, remainingAttempts)
    
            },
            requestAttempts : 1,
            retryOnConnectionError: true
        }
    );

    return sfmc
};