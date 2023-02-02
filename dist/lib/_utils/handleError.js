"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = void 0;
const display_1 = require("./display");
const handleError = (err) => {
    if (Object.prototype.hasOwnProperty.call(err, 'JSON') &&
        Object.prototype.hasOwnProperty.call(err.JSON, 'Results') &&
        err.JSON.Results.length > 0 &&
        Object.prototype.hasOwnProperty.call(err.JSON.Results[0], 'StatusMessage')) {
        (0, display_1.displayLine)(err.JSON.Results[0].StatusMessage, 'error');
        return;
    }
    if (Object.prototype.hasOwnProperty.call(err, 'response') &&
        Object.prototype.hasOwnProperty.call(err, 'data') &&
        Object.prototype.hasOwnProperty.call(err, 'error_description')) {
        (0, display_1.displayLine)(err.response.data.error_description, 'error');
        return;
    }
    if (typeof err === 'object') {
        (0, display_1.displayLine)(JSON.stringify(err));
        return;
    }
    if (err && err.message) {
        (0, display_1.displayLine)(err.message, 'error');
        return;
    }
    (0, display_1.displayLine)(err, 'error');
    return;
};
exports.handleError = handleError;
