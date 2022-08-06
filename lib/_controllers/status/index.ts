import { Stash } from '../../_bldr/_processes/Stash';
import { Argv } from '../../_types/Argv';
import { Status } from '../../_bldr/_processes/Status';
const { displayStatus } = new Status();
const { getStashArray } = new Stash();

/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function StatusSwitch() {
    return displayStatus();
}
