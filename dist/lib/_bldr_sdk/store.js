"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.state_conf = exports.stash_conf = void 0;
const source_1 = __importDefault(require("conf/dist/source"));
const stash_conf = new source_1.default({
    configName: 'stash',
});
exports.stash_conf = stash_conf;
const state_conf = new source_1.default({
    configName: `sfmc__stateManagement`,
});
exports.state_conf = state_conf;
