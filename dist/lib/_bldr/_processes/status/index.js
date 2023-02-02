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
exports.Status = void 0;
const state_1 = require("../state");
const stash_1 = require("../stash");
const display_1 = require("../../../_utils/display");
const { getState } = new state_1.State();
const { displayStashStatus } = new stash_1.Stash();
class Status {
    constructor() {
        /**
         * Display Status messaging and state
         */
        this.displayStatus = () => __awaiter(this, void 0, void 0, function* () {
            (0, display_1.displayLine)('Current Status', 'info');
            yield getState('', true);
            yield displayStashStatus();
        });
    }
}
exports.Status = Status;
