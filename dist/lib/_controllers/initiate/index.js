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
exports.InitSwitch = void 0;
const initiate_1 = require("../../_bldr/_processes/initiate");
const initiate = new initiate_1.Initiate();
/**
 * Flag routing for init command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} blueprint
 */
function InitSwitch(argv) {
    return __awaiter(this, void 0, void 0, function* () {
        if (argv['update-env-keys']) {
            return initiate.updateKeys();
        }
        if (argv['env-only']) {
            return initiate.envOnly();
        }
        if (argv.cb) {
            return initiate.initiateContentBuilderProject();
        }
        if (argv.de) {
            return initiate.initiateDataExtension();
        }
    });
}
exports.InitSwitch = InitSwitch;
