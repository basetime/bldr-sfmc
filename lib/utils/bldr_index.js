const BLDR = require("../../bldr_lib/BLDR");
const State = require("./Blueprint/State")
const Config = require("./Blueprint/Config");
const utils = require("../utils/utils")


const bldr = async (mid, store) => {
  try {
    const state = utils.assignObject(store.state.get())
    const instance = state.instance;
    const configurationObject = utils.assignObject(store.config.get(instance))
    const accountId = mid || state.activeMid || configurationObject.parentMID;

    return new BLDR({
      client_id: configurationObject.apiClientId,
      client_secret: configurationObject.apiClientSecret,
      auth_url: `https://${configurationObject.instanceSubdomain}.auth.marketingcloudapis.com/`,
      account_id: Number(accountId),
    },
      {
        eventHandlers: {
          onLoop: (type, accumulator) => console.log('Looping', type, accumlator.length),
          // onRefresh: (options) => console.log('RefreshingToken.', Options),
          // logRequest: (req) => console.log(req),
          // logResponse: (res) => console.log(res),
          onConnectionError: (ex, remainingAttempts) => console.log(ex.code, remainingAttempts)

        },
        requestAttempts: 1,
        retryOnConnectionError: true
      })

  } catch (err) {
    console.log(err)
    console.log('Authentication Error')
  }
}

module.exports = bldr
