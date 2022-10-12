/**
 * @param {object} authObject Auth object
 * @returns {boolean} true if token is expired
 */
 function isExpired(authObject: any) {
    let expired = false;
    // if current atomic time is equal or after exp, or we don't have a token, return true
    if (
        (authObject.expiration && authObject.expiration <= process.hrtime()[0]) ||
        !authObject.access_token
    ) {
        expired = true;
    }

    return expired;
}


export {
    isExpired
}
