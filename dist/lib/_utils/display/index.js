"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayArrayOfStrings = exports.displayObject = exports.displayLine = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * Display a single line in the command-line
 * @param message
 * @param status success | error | info
 */
const displayLine = (message, status) => {
    let statusOutput;
    switch (status) {
        case 'success':
            statusOutput = chalk_1.default.green;
            break;
        case 'error':
            statusOutput = chalk_1.default.red;
            break;
        case 'info':
            statusOutput = chalk_1.default.cyan;
            break;
        case 'progress':
            statusOutput = chalk_1.default.yellow;
            break;
        case 'warn':
            statusOutput = chalk_1.default.magenta;
            break;
        default:
            statusOutput = chalk_1.default.white;
    }
    console.log(statusOutput(message));
};
exports.displayLine = displayLine;
/**
 * Iterate through an object displaying `key: value`
 * @param object
 * @param status
 */
const displayObject = (object, status) => {
    displayLine('---');
    for (const o in object) {
        if (typeof object[o] !== 'object') {
            displayLine(`${o} ${object[o]}`, status);
        }
    }
    displayLine(' ');
};
exports.displayObject = displayObject;
const displayArrayOfStrings = (array, status) => {
    displayLine('---');
    array.forEach((item) => displayLine(item, status));
    displayLine(' ');
};
exports.displayArrayOfStrings = displayArrayOfStrings;
