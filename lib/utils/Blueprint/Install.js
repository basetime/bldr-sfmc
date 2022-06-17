const fs = require('fs');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const packageReference = require('../packageReference');
const axios = require('axios');
const { styles, width } = display.init();

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
module.exports = class Deploy {
    constructor(bldr, localFile, contextMap, store, stash) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
        this.stash = stash;
    }

    async init(argv) {
        let packageJSON;

        let deployURL = argv._[1];
        deployURL = deployURL.replace(/^\/\/|^.*?:(\/\/)?/, '');

        if (deployURL.includes('github')) {
            packageJSON = await this.getGitHubJSON(deployURL);
        }

        packageJSON = JSON.parse(packageJSON);

        const deployOrder = ['dataExtension', 'contentBuilder'];

        // deployOrder.forEach((ctx) => {
        //     if (packageJSON[ctx]) {
        //         const assetsPost = packageJSON[ctx]['assets'];
        //         const folderPaths = packageJSON[ctx]['folders'];;

        //         // Create empty directories
        //         this.localFile.createAllDirectories(folderPaths);

        //         // Create all directories and files
        //         this.localFile.createEditableFiles(assetsPost, ctx, false);

        //         // Update ManifestJSON file with responses
        //         this.localFile.manifestJSON(
        //             ctx,
        //             { folders: [] },
        //             null
        //         );

        //         // Update ManifestJSON file with responses
        //         this.localFile.manifestJSON(
        //             ctx,
        //             { assets: [] },
        //             null
        //         );
        //     }
        // })

        // await this.localFile.appendBLDR(null, './');

        if (Object.prototype.hasOwnProperty.call(packageJSON, 'sfmcConfig')) {
            await utils.createAPIConfig(packageJSON.sfmcConfig, false);
        }

        const rootDir = await this.localFile._getRootPath(this.contextMap);
        await this.localFile.createFile(
            `./.package.manifest.json`,
            JSON.stringify(packageJSON, null, 2)
        );
    }

    async getGitHubJSON(deployURL) {
        //process github
        const deployArray = deployURL.split('/');
        const owner = deployArray[1];
        const repo = deployArray[2].substring(0, deployArray[2].indexOf('.'));

        const requestPackageJSON = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/.package.manifest.json`
        );
        const encodedPackageJSON = requestPackageJSON.data.content;
        const bufferPackageJSON = Buffer.from(encodedPackageJSON, 'base64');
        const packageJSON = bufferPackageJSON.toString('utf8');
        return packageJSON;
    }
};
