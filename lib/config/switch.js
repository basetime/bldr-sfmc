const Config = require('../utils/Blueprint/Config');
const State = require('../utils/Blueprint/State');

/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
module.exports.switch = async (req, argv, store) => {
    const configInit = new Config(store.config, store.state);
    const stateInit = new State(store.config, store.state);

    /**
     * Configure New Instance
     */
    if (argv.n || argv.new) return configInit.init(argv);

    /**
     * Get Configuration by Instance key
     */
    if (argv._[1]) return configInit.get(argv._[1], true);

    /**
     * List all Configurations
     */
    if (argv.l || argv.list) return configInit.list(argv);

    /**
     * Remove Configuration by Instance Key
     */
    if (argv.r || argv.remove) return configInit.remove(argv);

    /**
     * Set State Instance
     */
    if (argv.s || argv.set) return stateInit.set(argv);

    /**
     * Encrypt Existing Configurations
     */
    if (argv.encrypt) return configInit.encryptExisting();

    /**
     * Handle unknown flags
     */
    return store.help.init();
};
