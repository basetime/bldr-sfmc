import { Stash } from '../../_bldr/_processes/stash';
import { Argv } from '../../_types/Argv';
import { Status } from '../../_bldr/_processes/status';
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
