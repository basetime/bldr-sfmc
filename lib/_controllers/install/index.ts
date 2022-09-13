import { Install } from '../../_bldr/_processes/install';
import { Argv } from '../../_types/Argv';
const { installPackage } = new Install();

/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function InstallSwitch(argv: Argv) {
    return installPackage(argv);
}
