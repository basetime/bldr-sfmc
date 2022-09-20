import { state_conf } from '../../../_bldr_sdk/store';
import { displayLine, displayObject } from '../../../_utils/display';
import { incrementMetric } from '../../../_utils/metrics';
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

    toggleVerbose = () => {
        const isVerbose = state_conf.get('isVerbose');
        if (isVerbose !== 'undefined') {
            isVerbose && displayLine('Verbose messaging turned off', 'info');
            !isVerbose && displayLine('Verbose messaging turned on', 'info');
            state_conf.set({
                isVerbose: !isVerbose,
            });
        } else {
            state_conf.set({
                isVerbose: false,
            });
        }
    };

    isVerbose = () => {
        return state_conf.get('isVerbose') || false;
    };


    toggleTracking = () => {
        const allowTracking = state_conf.get('allowTracking');
        if (allowTracking !== 'undefined') {
            allowTracking && displayLine('allowTracking turned off', 'info');
            !allowTracking && displayLine('allowTracking turned on', 'info');
            state_conf.set({
                allowTracking: !allowTracking,
            });
        } else {
            state_conf.set({
                allowTracking: false,
            });
        }
    };

    allowTracking = () => {
        return state_conf.get('allowTracking') || false;
    };

    checkForTracking = async () => {
        const hasAllowTracking = state_conf.has('allowTracking');
        if(!hasAllowTracking) {
            state_conf.set({
                allowTracking: true
            })
        }
    }
}
