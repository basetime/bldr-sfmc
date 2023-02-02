const utils = require('../utils');
const axios = require('axios');

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
        try {
            let packageJSON;

            let deployURL = argv._[1];
            deployURL = deployURL.replace(/^\/\/|^.*?:(\/\/)?/, '');

            if (deployURL.includes('github')) {
                packageJSON = await this.getGitHubJSON(deployURL);
            }

            if (packageJSON.status === 'Error') {
                throw new Error(packageJSON.statusText);
            }

            if (Object.prototype.hasOwnProperty.call(packageJSON, 'sfmcConfig')) {
                await utils.createAPIConfig(packageJSON.sfmcConfig, true);
            }

            await this.localFile.createFile(`./.package.manifest.json`, JSON.stringify(packageJSON, null, 2));
        } catch (err) {
            console.log(err.message);
        }
    }

    async getGitHubJSON(deployURL) {
        try {
            //process github
            const deployArray = deployURL.split('/');
            const owner = deployArray[1];
            const repo =
                deployArray[2].indexOf('.') === -1
                    ? deployArray[2]
                    : deployArray[2].substring(0, deployArray[2].indexOf('.'));
            const getRepository = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/`);

            if (!getRepository) {
                throw new Error('Repository not found.');
            }

            const packageJSON = getRepository.data.find((file) => file.name === '.package.manifest.json');
            if (!packageJSON) {
                throw new Error('.package.manifest.json not found');
            } else {
                const getPackageJSON = await axios.get(packageJSON.download_url);

                return getPackageJSON.data;
            }
        } catch (err) {
            return {
                status: 'Error',
                statusText: err.message,
            };
        }
    }
};
