import {Initiate} from '../../_bldr/_processes/initiate'
const initiate = new Initiate();
/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function InitSwitch(argv: any) {
    if (argv['update-config-keys']) {
        return initiate.updateKeys();
    }

    if (argv['config-only']) {
        return initiate.configOnly();
    }

    if (argv.cb) {
        return initiate.initiateContentBuilderProject();
    }
}
