
import { State } from '../State';
import { Stash } from '../Stash';
import { displayObject, displayLine } from '../../../_utils/display';
const { getState } = new State();
const { displayStashStatus } = new Stash()

export class Status {
    constructor() { }
    /**
     *
     */
    displayStatus = async () => {
        displayLine('Current Status', 'info')
        await getState('', true)
        await displayStashStatus()
    };


}
