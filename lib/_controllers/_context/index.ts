import { Argv } from '../../_types/Argv';
import { ContentBuilderSwitch } from './contentBuilder';
import { AutomationStudioSwitch } from './automationStudio';
import { DataExtensionSwitch } from './dataExtension';
/*
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const ContextSwitch = async (req: any, argv: Argv) => {
    /**
     * Configure New Instance
     */
    if (
        !argv['content-builder'] &&
        !argv.cb &&
        !argv['automation-studio'] &&
        !argv.as &&
        !argv.de &&
        !argv['data-extension']
    ) {
        throw new Error('Please include a context flag');
    }

    if (argv.cb || argv['content-builder']) {
        ContentBuilderSwitch(req, argv);
    }

    if (argv.as || argv['automation-studio']) {
        AutomationStudioSwitch(req, argv);
    }

    if (argv.de || argv['data-extension']) {
        DataExtensionSwitch(req, argv);
    }
    // /**
    //  * Get Configuration by Instance key
    //  * argv._[0] is the command
    //  */
    // if (argv._ && argv._[1]) {
    //   return getInstanceConfiguration(argv._[1], true);
    // }

    // /**
    //  * List all Configurations
    //  */
    // if (argv.l || argv.list) {
    //   return listInstanceConfiguration(argv);
    // }

    // /**
    //  * Remove Configuration by Instance Key
    //  */
    // if (argv.r || argv.remove) {
    //   return removeConfiguration(argv);
    // }
    // /**
    //  * Set State Instance
    //  */
    // if (argv.s || argv.set) {
    //   return setConfiguration(argv);
    // }

    return;
};

export { ContextSwitch };
