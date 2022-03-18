const SDK = require('sfmc-sdk');
const Folder = require('./Folder')

module.exports = class BLDR {
    /**
     * Creates an instance of BLDR SDK.
     *
     * @param {object} authObject Auth Object for making requests
     */
    constructor(authObject) {
        this.authObject = authObject;
        this.client = new SDK(this.authObject);
        this.folder = new Folder(this.client.rest, this.client.soap);
    }
};
