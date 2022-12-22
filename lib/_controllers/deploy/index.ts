import { Deploy } from '../../_bldr/_processes/deploy';
import { Argv } from '../../_types/Argv';
const { deployPackage } = new Deploy();

/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function DeploySwitch(argv: Argv) {
    return deployPackage(argv);
}
