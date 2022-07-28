import { Config } from "../../_bldr/_processes/Config";
import { Argv } from "../../_types/Argv";

const {
  initiateConfiguration,
  getInstanceConfiguration,
  listInstanceConfiguration,
  removeConfiguration,
  setConfiguration,
} = new Config();
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
const ConfigSwitch = async (req: any, argv: Argv, store?: any) => {
  /**
   * Configure New Instance
   */
  if (argv.n || argv.new) {
    return initiateConfiguration(argv);
  }

  /**
   * Get Configuration by Instance key
   * argv._[0] is the command
   */
  if (argv._ && argv._[1]) {
    return getInstanceConfiguration(argv._[1], true);
  }

  /**
   * List all Configurations
   */
  if (argv.l || argv.list) {
    return listInstanceConfiguration(argv);
  }

  /**
   * Remove Configuration by Instance Key
   */
  if (argv.r || argv.remove) {
    return removeConfiguration(argv);
  }
  /**
   * Set State Instance
   */
  if (argv.s || argv.set) {
    return setConfiguration(argv);
  }

  return;
};

export { ConfigSwitch };
