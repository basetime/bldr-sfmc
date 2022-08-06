import { Push } from '../../_bldr/_processes/push';
import { Argv } from '../../_types/Argv';

const { pushStash } = new Push();

/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function PushSwitch() {
    return pushStash();
}
