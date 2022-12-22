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
exports.ContextSwitch = void 0;
const contentBuilder_1 = require("./contentBuilder");
const automationStudio_1 = require("./automationStudio");
const dataExtension_1 = require("./dataExtension");
/*
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const ContextSwitch = (req, argv) => __awaiter(void 0, void 0, void 0, function* () {
    /**
     * Configure New Instance
     */
    if (!argv['content-builder'] &&
        !argv.cb &&
        !argv['automation-studio'] &&
        !argv.as &&
        !argv.de &&
        !argv['data-extension']) {
        throw new Error('Please include a context flag');
    }
    if (argv.cb || argv['content-builder']) {
        (0, contentBuilder_1.ContentBuilderSwitch)(req, argv);
    }
    if (argv.as || argv['automation-studio']) {
        (0, automationStudio_1.AutomationStudioSwitch)(req, argv);
    }
    if (argv.de || argv['data-extension']) {
        (0, dataExtension_1.DataExtensionSwitch)(req, argv);
    }
    // /**
    //  * Get Configuration by Instance key
    //  * argv._[0] is the command
    //  */
    // if (argv._ && argv._[1]) {
    //   return getInstanceConfiguration(argv._[1], true);
    // }
    // /**
    //  * List all Configurations
    //  */
    // if (argv.l || argv.list) {
    //   return listInstanceConfiguration(argv);
    // }
    // /**
    //  * Remove Configuration by Instance Key
    //  */
    // if (argv.r || argv.remove) {
    //   return removeConfiguration(argv);
    // }
    // /**
    //  * Set State Instance
    //  */
    // if (argv.s || argv.set) {
    //   return setConfiguration(argv);
    // }
    return;
});
exports.ContextSwitch = ContextSwitch;
