const SDK = require('sfmc-sdk');
const Account = require('./Account');
const Asset = require('./Asset');
const Describe = require('./Describe');
const Folder = require('./Folder');
const DataExtension = require('./DataExtension');
const QueryDefinition = require('./QueryDefinition');
const Automation = require('./Automation');

//TODO Separate out SFMC functions into its own package
//TODO Explore possibility of sfmc-sdk to allow oAuth token

module.exports = class SFMC {
    /**
     * Creates an instance of BLDR SDK.
     *
     * @param {object} authObject Auth Object for making requests
     */
    constructor(authObject) {
        this.authObject = authObject;
        this.client = new SDK(this.authObject);
        this.folder = new Folder(this.client.soap);
        this.asset = new Asset(this.client.rest);
        this.account = new Account(this.client.soap);
        this.describe = new Describe(this.client.soap);
        this.dataExtension = new DataExtension(this.client.soap);
        this.query = new QueryDefinition(this.client.rest, this.client.soap);
        this.automation = new Automation(this.client.rest, this.client.soap);
    }
};
