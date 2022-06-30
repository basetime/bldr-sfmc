const fs = require('fs');
const utils = require('../utils');

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
module.exports = class Initiate {
    constructor(bldr, localFile, contextMap, store, stash) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
        this.stash = stash;
    }

    async updateKeys() {
        try {
            // get all file and content
            // iterate and scrub keys
            // create editable files

            const ctxFiles = await utils.getAllFiles();
            for (const c in ctxFiles) {
                const filePath = ctxFiles[c];
                let content = fs.readFileSync(filePath).toString();
                content = await utils.scrubConfig(content);

                fs.writeFileSync(filePath, content);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    configOnly() {
        return utils.createAPIConfig();
    }
};
