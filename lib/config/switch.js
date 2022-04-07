const Config = require('../utils/Blueprint/Config');
const State = require('../utils/Blueprint/State');

/**
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
module.exports.switch = (req, argv, store) => {
    const configInit = new Config(store.config, store.state);
    const stateInit = new State(store.config, store.state);

    try {
        // Configure New Instance
        if (argv.n || argv.new) return configInit.init();
        // Get Configuration by Instance key
        if (argv._[1]) return configInit.get(argv._[1], true);
        // List all Configurations
        if (argv.l || argv.list) return configInit.list(argv);
        // Remove Configuration by Instance Keybldr
        if (argv.r || argv.remove) return configInit.remove(argv);
        // Set State Instance
        if (argv.s || argv.set) return stateInit.set(argv);
        // Show current State Object
        if (argv.state) return stateInit.get(null, true);
    } catch (err) {
        // Catch Unknown Requests
        return store.help.init();
    }
};
