"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
const keytar_sync_1 = require("keytar-sync");
const store_1 = require("../../../_bldr_sdk/store");
const display_1 = require("../../../_utils/display");
const metrics_1 = require("../../../_utils/metrics");
const _utils_1 = require("../../_utils");
// const Config = require('./Config');
// const Column = require('../help/Column');
// const utils = require('../utils');
// const display = require('../displayStyles');
// const { styles, width } = display.init();
// const configInit = new Config();
/**
 * @param {function get(params:type) {}}
 */
class State {
    constructor() {
        /**
         *
         * @returns
         */
        this.getCurrentInstance = () => __awaiter(this, void 0, void 0, function* () {
            const currentState = yield store_1.state_conf.get();
            return currentState.instance;
        });
        /**
         *
         * @param key
         * @param show
         * @returns
         */
        this.getState = (key, show) => {
            try {
                const state = (0, _utils_1.assignObject)(store_1.state_conf.get());
                if (!key) {
                    if (show) {
                        (0, display_1.displayObject)(state);
                    }
                    return state;
                }
                else {
                    if (key && store_1.state_conf.has(key))
                        if (show) {
                            (0, display_1.displayObject)(state);
                        }
                    return state[key];
                }
            }
            catch (err) {
                console.log(err);
            }
        };
        this.toggleVerbose = () => {
            const isVerbose = store_1.state_conf.get('isVerbose');
            if (isVerbose !== 'undefined') {
                isVerbose && (0, display_1.displayLine)('Verbose messaging turned off', 'info');
                !isVerbose && (0, display_1.displayLine)('Verbose messaging turned on', 'info');
                store_1.state_conf.set({
                    isVerbose: !isVerbose,
                });
            }
            else {
                store_1.state_conf.set({
                    isVerbose: false,
                });
            }
        };
        this.isVerbose = () => {
            return store_1.state_conf.get('isVerbose') || false;
        };
        this.toggleTracking = () => {
            const allowTracking = store_1.state_conf.get('allowTracking');
            if (allowTracking !== 'undefined') {
                allowTracking && (0, display_1.displayLine)('allowTracking turned off', 'info');
                !allowTracking && (0, display_1.displayLine)('allowTracking turned on', 'info');
                store_1.state_conf.set({
                    allowTracking: !allowTracking,
                });
            }
            else {
                store_1.state_conf.set({
                    allowTracking: false,
                });
            }
        };
        this.allowTracking = () => {
            return store_1.state_conf.get('allowTracking') || false;
        };
        this.toggleDebug = () => {
            const debugMode = store_1.state_conf.get('debugMode');
            if (debugMode !== 'undefined') {
                debugMode && (0, display_1.displayLine)('debugMode turned off', 'info');
                !debugMode && (0, display_1.displayLine)('debugMode turned on', 'info');
                store_1.state_conf.set({
                    debugMode: !debugMode,
                });
            }
            else {
                store_1.state_conf.set({
                    debugMode: false,
                });
            }
        };
        this.debugMode = () => {
            return store_1.state_conf.get('debugMode') || false;
        };
        this.debug = (debugContext, debugStatus, output) => {
            const debug = this.debugMode();
            if (!debug) {
                return;
            }
            try {
                (0, display_1.displayLine)(debugContext, debugStatus);
                if (output && output.JSON && output.JSON.Results) {
                    console.log(JSON.stringify(output.JSON.Results, null, 2));
                    return;
                }
                typeof output === 'string' ? console.log(output) : console.log(JSON.stringify(output, null, 2));
            }
            catch (err) {
                console.log(output);
            }
        };
        this.checkForTracking = () => __awaiter(this, void 0, void 0, function* () {
            const hasAllowTracking = store_1.state_conf.has('allowTracking');
            if (!hasAllowTracking) {
                yield (0, metrics_1.incrementMetric)('downloads');
                store_1.state_conf.set({
                    allowTracking: true,
                });
                yield (0, display_1.displayLine)(`BLDR is configured to collect basic analytics`, 'info');
                yield (0, display_1.displayLine)(`Visit https://github.com/basetime/bldr-sfmc for more information on what is being captured`, 'info');
                yield (0, display_1.displayLine)(`If you wish to opt-out of analytics, run [ bldr config --analytics ] to disable this functionality`, 'info');
            }
        });
        this.clearSession = () => __awaiter(this, void 0, void 0, function* () {
            yield (0, keytar_sync_1.deletePassword)('bldr', 'currentSession');
            const sessionDeleted = (yield (0, keytar_sync_1.getPassword)('bldr', 'currentSession')) ? false : true;
            return sessionDeleted;
        });
    }
}
exports.State = State;
