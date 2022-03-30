const Config = require("../utils/Blueprint/Config");
const State = require("../utils/Blueprint/State");

module.exports.switch = (req, argv, store) => {
  const configInit = new Config(store.config, store.state)
  const stateInit = new State(store.config, store.state)

  try {
    // Configure New Instance
    if (argv.n || argv.new) return configInit.init()
    // Get Configuration by Instance key
    if (argv._[1]) return configInit.get(argv._[1]);
    // List all Configurations
    if (argv.l || argv.list) return configInit.list(argv);
    // Delete Configuration by Instance Key
    if (argv.r || argv.remove) return configInit.delete(argv);
    // Set State Instance
    if (argv.s || argv.set) return stateInit.set(argv);

    if (argv.state) return stateInit.get(null, true);

  } catch (err) {
    // Catch Unknown Requests
    return store.help.init();
  };
}

