const Conf = require("conf");
const BLDR = require("../../bldr_lib/BLDR");
const State = require("./Blueprint/State")
const Config = require("./Blueprint/Config");
const { config } = require("cli-format/bin/format-config");

const coreConfiguration = new Conf();
const stateConfiguration = new Conf({
  configName: `sfmc__stateManagement`,
})

const configInit = new Config(coreConfiguration);
const stateInit = new State(coreConfiguration, stateConfiguration);

const bldr = (mid) => {
  try {

    const stateInstance = stateInit.get(null, false)
    const configurationObject = configInit.get(stateInstance.instance)
    const accoutId = mid || stateInstance.activeMid || configurationObject.parentMID;

    return new BLDR({
      client_id: configurationObject.apiClientId,
      client_secret: configurationObject.apiClientSecret,
      auth_url: `https://${configurationObject.instanceSubdomain}.auth.marketingcloudapis.com/`,
      account_id: Number(accoutId),
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
    console.log('Authentication Error')
  }
}

module.exports = bldr
