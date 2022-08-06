import { Stash } from '../../_bldr/_processes/stash';
import { Argv } from '../../_types/Argv';

const { clearStash } = new Stash();

/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
export async function StashSwitch(argv: Argv) {
    if (argv.c || argv.clear) {
        return clearStash();
    }
}
