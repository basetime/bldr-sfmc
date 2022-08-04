import { Add } from "../../_bldr/_processes/Add";
import { Argv } from "../../_types/Argv";

const { addFiles, addAllFiles } = new Add();
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const AddSwitch = async (req: any, argv: Argv) => {
  /**
   * Configure New Instance
   */
  if (argv && argv._ && argv._[1] && argv._[1] === ".") {
    return addAllFiles();
  }

  /**
   * Add specific list of files based on folder paths
   */
  if (argv && argv._ && argv._[1] && argv._[1] !== ".") {
    return addFiles(argv);
  }

  return;
};

export { AddSwitch };
