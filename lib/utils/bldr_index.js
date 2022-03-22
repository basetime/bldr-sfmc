const Conf = require("conf");
const BLDR = require("../../bldr_lib/BLDR");
const State = require("./Blueprint/State")
const Config = require("./Blueprint/Config")

const coreConfiguration = new Conf();
const stateConfiguration = new Conf({
  configName: `sfmc__stateManagement`,
})

const configInit = new Config(coreConfiguration);
const stateInit = new State(coreConfiguration, stateConfiguration);

const stateInstance = stateInit.get('instance', false)
const configurationObject = configInit.get(stateInstance)
const client = configurationObject;

const bldr = new BLDR({
  client_id: client.apiClientId,
  client_secret: client.apiClientSecret,
  auth_url: `https://${client.instanceSubdomain}.auth.marketingcloudapis.com/`,
  account_id: Number(client.parentMID),
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

  module.exports = bldr
