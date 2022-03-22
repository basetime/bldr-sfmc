const SDK = require('sfmc-sdk');
const Clone = require('../lib/utils/Blueprint/Clone');
const Asset = require('./Asset');
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
        this.folder = new Folder(this.client.soap);
        this.asset = new Asset(this.client.rest)
    }
};
