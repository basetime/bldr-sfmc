import { deletePassword, getPassword } from 'keytar-sync';
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

    toggleDebug = () => {
        const debugMode = state_conf.get('debugMode');
        if (debugMode !== 'undefined') {
            debugMode && displayLine('debugMode turned off', 'info');
            !debugMode && displayLine('debugMode turned on', 'info');
            state_conf.set({
                debugMode: !debugMode,
            });
        } else {
            state_conf.set({
                debugMode: false,
            });
        }
    };

    debugMode = () => {
        return state_conf.get('debugMode') || false;
    };

    debug = (debugContext: string, debugStatus: 'success' | 'error' | 'info', output: any) => {
        const debug = this.debugMode();
        if (!debug) {
            return;
        }

        try {
            displayLine(debugContext, debugStatus);
            if (output && output.JSON && output.JSON.Results) {
                console.log(JSON.stringify(output.JSON.Results, null, 2));
                return;
            }

            typeof output === 'string' ? console.log(output) : console.log(JSON.stringify(output, null, 2));
        } catch (err) {
            console.log(output);
        }
    };

    checkForTracking = async () => {
        const hasAllowTracking = state_conf.has('allowTracking');
        if (!hasAllowTracking) {
            await incrementMetric('downloads');
            state_conf.set({
                allowTracking: true,
            });

            await displayLine(`BLDR is configured to collect basic analytics`, 'info');
            await displayLine(
                `Visit https://github.com/basetime/bldr-sfmc for more information on what is being captured`,
                'info'
            );
            await displayLine(
                `If you wish to opt-out of analytics, run [ bldr config --analytics ] to disable this functionality`,
                'info'
            );
        }
    };

    clearSession = async () => {
        await deletePassword('bldr', 'currentSession');

        const sessionDeleted = (await getPassword('bldr', 'currentSession')) ? false : true;
        return sessionDeleted;
    };
}
