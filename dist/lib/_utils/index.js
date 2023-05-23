"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExpired = void 0;
/**
 * @param {object} authObject Auth object
 * @returns {boolean} true if token is expired
 */
function isExpired(authObject) {
    let expired = false;
    if (!authObject.access_token) {
        expired = true;
    }
    // if current atomic time is equal or after exp, or we don't have a token, return true
    if (authObject.expiration && authObject.expiration < process.hrtime()[0]) {
        expired = true;
    }
    return expired;
}
exports.isExpired = isExpired;
