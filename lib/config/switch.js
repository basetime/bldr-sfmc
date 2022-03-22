const opts = require("../utils/options");
const help = require('../help/init');
const Conf = require('conf')
const Config = require("../utils/Blueprint/Config");
const State = require("../utils/Blueprint/State")

const coreConfiguration = new Conf();
const stateConfiguration = new Conf({
  configName: `sfmc__stateManagement`,
})

const configInit = new Config(coreConfiguration)
const stateInit = new State(coreConfiguration, stateConfiguration)


module.exports.switch = (req, argv) => {
  // Configure New Instance
  if (argv.n || argv.new) return configInit.init();
  // Get Configuration by Instance key
  if (argv._[1]) return configInit.get(argv._[1]);
  // List all Configurations; Use Flag -a to List Details
  if (argv.l || argv.list) return configInit.list(argv);
  // Delete Configuration by Instance Key
  if (argv.d || argv.delete) return configInit.delete(argv);
  // Set State Instance
  if (argv.s || argv.set) return stateInit.set(argv);
 
  // Catch Unknown Requests
  help.init();
};
