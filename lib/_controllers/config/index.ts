import { Config } from "../../_bldr/_processes/Config";

const {
    init
} = new Config()
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
const ConfigSwitch = async (req: any, argv: {
    n?: string;
    new?: string;
}, store?: any) => {

    /**
     * Configure New Instance
     */
    if (argv.n || argv.new) {
        return init(argv);
    }

    // /**
    //  * Get Configuration by Instance key
    //  */
    // if (argv._[1]) return configInit.get(argv._[1], true);

    // /**
    //  * List all Configurations
    //  */
    // if (argv.l || argv.list) return configInit.list(argv);

    // /**
    //  * Remove Configuration by Instance Key
    //  */
    // if (argv.r || argv.remove) return configInit.remove(argv);

    // /**
    //  * Set State Instance
    //  */
    // if (argv.s || argv.set) return stateInit.set(argv);

    // /**
    //  * Encrypt Existing Configurations
    //  */
    // if (argv.encrypt) return configInit.encryptExisting();

    /**
     * Handle unknown flags
     */
    return //store.help.init();
};

export {
    ConfigSwitch
}
