import { Initiate } from '../../_bldr/_processes/initiate';
import { Argv } from '../../_types/Argv';
const initiate = new Initiate();
/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function InitSwitch(argv: Argv) {
    if (argv['update-env-keys']) {
        return initiate.updateKeys();
    }

    if (argv['env-only']) {
        return initiate.envOnly();
    }

    if (argv.cb) {
        return initiate.initiateContentBuilderProject();
    }

    if (argv.de) {
        return initiate.initiateDataExtension();
    }
}
