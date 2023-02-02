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
            const rootPath = this.localFile._getRootPath(this.contextMap);

            const ctxFiles = await utils.getAllFiles();
            for (const c in ctxFiles) {
                const filePath = ctxFiles[c];
                let content = fs.readFileSync(filePath).toString();
                content = await utils.scrubConfig(content);

                fs.writeFileSync(filePath, content);
            }

            const manifestJSON = this.localFile._getManifest(rootPath);
            let manifestStr = JSON.stringify(manifestJSON);
            let updatedManifest = JSON.parse(await utils.scrubConfig(manifestStr));
            fs.writeFileSync(`${rootPath}.local.manifest.json`, JSON.stringify(updatedManifest, null, 2));

            if (this.localFile._fileExists(`${rootPath}.package.manifest.json`)) {
                const pkgJSON = this.localFile._getSFMCPackage();
                let pkgStr = JSON.stringify(pkgJSON);
                let updatedPkg = JSON.parse(await utils.scrubConfig(pkgStr));
                fs.writeFileSync(`${rootPath}.package.manifest.json`, JSON.stringify(updatedPkg, null, 2));
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    configOnly() {
        return utils.createAPIConfig();
    }
};
