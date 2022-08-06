import { state_conf } from '../../../_bldr_sdk/store';
import { displayObject } from '../../../_utils/display';
import { assignObject } from '../../_utils';

// const Config = require('./Config');
// const Column = require('../help/Column');

// const utils = require('../utils');
// const display = require('../displayStyles');
// const { styles, width } = display.init();

// const configInit = new Config();

/**
 * @param {function get(params:type) {}}
 */
export class State {
    constructor() {}
    /**
     *
     * @returns
     */
    getCurrentInstance = async () => {
        const currentState = await state_conf.get();
        return currentState.instance;
    };
    /**
     *
     * @param key
     * @param show
     * @returns
     */
    getState = (key?: string, show?: Boolean) => {
        try {
            const state = assignObject(state_conf.get());

            if (!key) {
                if (show) {
                    displayObject(state);
                }
                return state;
            } else {
                if (key && state_conf.has(key))
                    if (show) {
                        displayObject(state);
                    }

                return state[key];
            }
        } catch (err) {
            console.log(err);
        }
    };

    // /**
    //  *
    //  * @param argv
    //  */
    // async set(argv: {
    //     s?: string;
    //     set?: string;
    //     m?: string;
    //     mid?: string
    // }) {
    //     try {
    //         const instanceToSet = argv.s || argv.set;
    //         const midToSet = argv.m || argv.mid;

    //         if (typeof instanceToSet !== 'string')
    //             throw new Error('Please provide an Instance Name to Set.');

    //         const clientConfig = await configInit.get(instanceToSet);

    //         if (!clientConfig)
    //             throw new Error(`${instanceToSet} is not Configured`);

    //         if (
    //             midToSet &&
    //             !clientConfig.mids.find((bu) => bu.mid === midToSet)
    //         )
    //             throw new Error(`${midToSet} is not a Valid MID`);

    //         const initState = {
    //             instance: instanceToSet,
    //             parentMID: clientConfig.parentMID,
    //             activeMID: midToSet || clientConfig.parentMID,
    //         };

    //         this.stateConfiguration.set(initState);

    //         const displayHeader = [new Column(`Configuration Set`, width.c3)];
    //         const displayContent = [
    //             [new Column(`${JSON.stringify(initState, null, 2)}`, width.c3)],
    //         ];

    //         display.render(displayHeader, displayContent);
    //     } catch (err) {
    //         const displayHeader = [
    //             new Column(
    //                 `${styles.error('Set Configuration Error')}`,
    //                 width.c3
    //             ),
    //         ];

    //         const displayContent = [[new Column(err.message, width.c3)]];

    //         display.render(displayHeader, displayContent);
    //     }
    // }

    // update(update) {
    //     if (!update.key) {
    //         throw new Error('Key required');
    //     }
    //     if (!update.value) {
    //         throw new Error('Value required');
    //     }

    //     return this.stateConfiguration.set(update.key, update.value);
    // }

    // deleteKey(argv) {
    //     return this.stateConfiguration.has(argv.d)
    //         ? this.stateConfiguration.delete(argv.d)
    //         : null;
    // }

    // clear() {
    //     return this.stateConfiguration.clear();
    // }
}
