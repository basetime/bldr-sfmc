const utils = require('../../../utils');
const Column = require('../../../help/Column');
const display = require('../../../displayStyles');
const { styles, width } = display.init();
const yargsInteractive = require('yargs-interactive');
const coreConfigurationOptions = require('../../../options');

// const contextMap = require('../../../contextMap')

/**
 * Handle all Folder clone requests
 * Interacts with SFMC API via sfmc-api-wrapper lib
 */
module.exports = class CBClone {
    constructor(bldr, localFile, contextMap, store) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
    }

    async init() {
        const rootPath = await this.localFile._getRootPath(this.contextMap);
        const isDirEmpty = await !this.localFile._fileExists(`${rootPath}Content Builder`);

        if (isDirEmpty) {
            yargsInteractive()
                .usage('$bldr init [args]')
                .interactive(coreConfigurationOptions.cb_init())
                .then(async (initResults) => {
                    const folderPaths = [
                        {
                            folderPath: `Content Builder/${initResults.projectName}`,
                        },
                    ];

                    // Create empty directories
                    await this.localFile.createAllDirectories(folderPaths);

                    if (initResults.createConfig) {
                        await utils.createAPIConfig();
                    }

                    // Update ManifestJSON file with responses
                    await this.localFile.manifestJSON('contentBuilder', { folders: [] }, null);

                    // Update ManifestJSON file with responses
                    await this.localFile.manifestJSON('contentBuilder', { assets: [] }, null);

                    await this.localFile.appendBLDR(null, './');
                });
        } else {
            const displayContent = [[new Column(`${styles.callout('Root directory must be empty')}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**test
     * Gathers and formats all assets from targeted SFMC CategoryID
     *
     * @param {String} argv user input from CLI
     * @param {String} context provided context from contextSwitch
     */
    async cloneFromFolder(argv, context) {
        try {
            const id = argv.f;
            let checkRootFolder = await this.bldr.folder.get('asset', id, false);
            let pathToRoot;

            if (checkRootFolder.OverallStatus === 'OK') {
                const rootFolderObj = checkRootFolder.Results[0];

                const rootFolderPaths = await this.setFolderPathRecursiveAsc({
                    id: rootFolderObj.ID,
                    name: rootFolderObj.Name,
                    parentId: rootFolderObj.ParentFolder.ID,
                    categoryType: 'asset',
                    rootFolder: false,
                });

                const pathToRootArray = rootFolderPaths.path.split('/');
                const parentFolderIndex = pathToRootArray.indexOf(rootFolderObj.ParentFolder.Name);
                pathToRoot = pathToRootArray.splice(0, parentFolderIndex).join('/');
            }

            // Get all subfolder data staring with a root Id provided by the user
            const folderPaths = await this.getFoldersRecursiveDESC(id, pathToRoot);

            // Check to ensure we have results
            if (folderPaths.length === 0) throw new Error(`No Folder Paths Found for ${styles.detail(id)}`);

            // Isolate all returned folder Ids for get asset filter
            const folderIds = await folderPaths.map(({ id }) => id);

            // Get all Content Builder assets via SFMC API based on the isolated folderIds Array
            const assetsResp = await this.bldr.asset.getByFolderArray(folderIds);

            // Check to ensure we have results
            if (!Object.prototype.hasOwnProperty.call(assetsResp, 'items') || assetsResp.items.length === 0) {
                throw new Error(`No Results found for ${styles.detail(id)}`);
            }

            // Format Asset Items to required key/values and append folder paths to objects
            const assetsPost = await this._formatDataForFile(assetsResp.items, folderPaths);

            // Create all directories and files
            await this.localFile.createEditableFiles(assetsPost, context);

            // Create empty directories
            await this.localFile.createAllDirectories(folderPaths);

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON('contentBuilder', { folders: folderPaths }, null);

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON('contentBuilder', { assets: assetsPost }, null);
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**
     * Handle all Asset clone requests
     * Interacts with SFMC API via sfmc-api-wrapper lib
     * @param {integer} id of the SFMC Asset
     */
    async cloneFromID(id, obj = null, legacy = false) {
        try {
            let assetResp;

            if (obj && obj.id) {
                assetResp = obj;
            } else if (legacy) {
                assetResp = await this.bldr.asset.getByLegacyId(id);
            } else {
                assetResp = await this.bldr.asset.getById(id);
            }

            // ensure there are results
            // catch error response
            if (
                Object.prototype.hasOwnProperty.call(assetResp, 'response') &&
                Object.prototype.hasOwnProperty.call(assetResp.response, 'status') &&
                assetResp.response.status === 404
            ) {
                throw new Error(`No Asset Found for ID ${id}`);
            }

            // Configure Category object for Asset
            const folderPaths = {
                id: assetResp[0].category.id,
                name: assetResp[0].category.name,
                parentId: assetResp[0].category.parentId,
                categoryType: 'asset',
            };

            // Build full folderPath
            const getFolderPaths = await this.setFolderPathRecursiveAsc(folderPaths);

            folderPaths.folderPath = getFolderPaths.path;

            // Format asset Object for SFMC POST/PUT and file write
            const assetsPost = await this._formatDataForFile(assetResp, new Array(folderPaths));

            // Create all gathered folders and assets locally
            await this.localFile.createEditableFiles(assetsPost, 'contentBuilder');

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON('contentBuilder', { folders: getFolderPaths.formattedFolders }, null);

            await this.localFile.manifestJSON('contentBuilder', { assets: assetsPost }, null);

            if (legacy) {
                return assetsPost[0].bldrId;
            }
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**
     * Method to format API response from SFMC into minimum required POST/PUT JSON objects
     * Updates Category object with full folder paths
     * Gathers additional data for Image assets
     *
     * @param {object} results from API Request
     * @param {object} folderPaths category object
     * @returns {object} Array of formatted asset payloads
     */
    async _formatDataForFile(results, folderPaths) {
        if (Array.isArray(results) && results.length !== 0) {
            const formatted = new Array();

            for (const r in results) {
                const asset = results[r];

                // Generate new bldrId for asset
                const bldrId = utils.guid();

                const searchPath = folderPaths.find(({ id }) => id === asset.category.id);

                const folderPath = searchPath ? searchPath.folderPath : '';

                // Create JSON structure for new asset post
                let post = {};
                post.id = asset.id;
                post.bldrId = bldrId;
                post.name = asset.name;
                post.customerKey = asset.customerKey;
                post.assetType = asset.assetType;
                post.category = asset.category;
                post.category.folderPath = folderPath;

                if (asset.content) {
                    post.content = asset.content;
                }
                if (asset.meta) {
                    post.meta = asset.meta;
                }
                if (asset.slots) {
                    post.slots = asset.slots;
                }
                if (asset.views) {
                    post.views = asset.views;
                }

                if (asset.assetType.displayName === 'Image') {
                    post.name =
                        asset.name.indexOf('.') === -1 ? asset.name : asset.name.substring(0, asset.name.indexOf('.'));
                    post.publishedURL = asset.fileProperties.publishedURL;
                    post.file = await this.bldr.asset.getImageFile(asset.id);
                }

                let postContent = await utils.getAssetContent(post);
                let scrubbedContent = await utils.scrubConfig(postContent);
                post = await utils.updateAssetContent(post, scrubbedContent);

                formatted.push(post);
            }

            return formatted;
        }
    }

    /**
     * Method to compile folder path for for Asset Clone
     *
     * @param {object} folderObj
     * @returns {string} compiled folder path
     */
    async setFolderPathRecursiveAsc(folderObj) {
        let path = folderObj.name;
        let parentId = folderObj.parentId;

        let foundFolders = new Array();
        foundFolders.push(folderObj);

        if (parentId === 0) {
            // console.log(path);
            return {
                path,
            };
        }

        do {
            const folderResp = await this.bldr.folder.get('asset', parentId, false);
            const results = folderResp.Results[0];

            foundFolders.push(results);
            parentId = results.ParentFolder.ID;
            path = `${results.Name}/${path}`;
        } while (parentId !== 0);

        const formattedFolders = await this._formatFolderResponse(foundFolders, folderObj.id);

        return {
            path,
            formattedFolders,
        };
    }

    /**
     * Method to gather and format all SFMC Folders recursively
     *
     * @param {integer} id
     * @returns
     */
    async getFoldersRecursiveDESC(id, pathToRoot = null) {
        try {
            let folders = [];
            let foldersOut = [];

            // Get target folder from SFMC
            let rootResp = await this.bldr.folder.get('asset', id, false);

            // Ensure response has results
            if (!Object.prototype.hasOwnProperty.call(rootResp, 'Results'))
                throw new Error(`Unable to find folder ${styles.callout(id)}`);

            // Format folder response for .bldrJSON and .local.manifest.json files
            rootResp = await this._formatFolderResponse(rootResp.Results, id);

            if (rootResp && rootResp.length !== 0) {
                let rootIdArray = rootResp.map((folder) => folder.id);
                folders.push(...rootIdArray);
                foldersOut = [...foldersOut, ...rootResp];
            }

            // Recursively get folders from SFMC
            do {
                let folderId = folders[0];
                // SFMC Folder response checking for subfolders
                let resp = await this.bldr.folder.get('asset', folderId, true);
                // Format folder response for .bldrJSON and .local.manifest.json files
                resp = await this._formatFolderResponse(resp.Results, id);

                if (resp && resp.length !== 0) {
                    let subfolderIdArray = resp.map((folder) => folder.id);
                    folders.push(...subfolderIdArray);
                    foldersOut = [...foldersOut, ...resp];
                }

                folders.shift();
            } while (folders.length !== 0);

            // Iterate and Compile all full folder paths of each folder object
            return this._formatFolderPaths(foldersOut, pathToRoot);
        } catch (err) {
            console.error(err);
        }
    }

    /**
     * Method to reduce API Reponse to required key/values
     *
     * @param {object} folders Array from API response
     * @param {integer} id of target Folder to identify root folder
     * @returns {object} Array of paired down folder objects
     */
    _formatFolderResponse(folders, id) {
        if (folders && folders.length !== 0) {
            const map = folders.map((folder) => {
                if (folder.Name !== 'Content Builder' || folder.name !== 'Content Builder') {
                    if (Object.prototype.hasOwnProperty.call(folder, 'id')) return folder;

                    return {
                        id: folder.ID,
                        name: folder.Name,
                        parentId: folder.ParentFolder.ID,
                        categoryType: folder.ContentType,
                        rootFolder: id === folder.ID ? true : false,
                    };
                }
            });

            return map.filter(Boolean);
        }

        return [];
    }

    /**
     * Method to compile all full folder paths for each folder object
     *
     * @param {object} folders Array of folder objects for local config files
     * @returns
     */
    async _formatFolderPaths(folders, pathToRoot = null) {
        const foldersOut = [];
        let path = pathToRoot ? `${pathToRoot}/` : '';
        let parentId;
        let hasParent;

        for (const f in folders) {
            let folderObj = folders[f];
            let parentFolder;

            // If folder is rootFolder make API call to get the SFMC Top Level Folder
            if (folderObj.rootFolder === true) {
                let parentResp = await this.bldr.folder.get('asset', folderObj.parentId, false);
                parentResp = await this._formatFolderResponse(parentResp.Results, folderObj.parentId);
                path += `${parentResp[0].name}/${folderObj.name}`;
            } else {
                parentId = folderObj.parentId;
                hasParent = true;

                // Check if folder path has already been compiled
                let establishedPath = foldersOut.find(({ id }) => id === parentId);

                // If path has been compiled use it else compile it and add it to established paths
                if (establishedPath) {
                    path = `${establishedPath.folderPath}/${folderObj.name}`;
                } else {
                    do {
                        parentFolder = await utils.getParentFolderFromArray(folders, parentId);
                        path += `/${parentFolder[0].name}`;
                        hasParent = parentFolder.length !== 0 ? true : false;
                    } while (!hasParent);

                    path += `/${folderObj.name}`;
                }
            }

            folderObj.folderPath = `${path}`;
            foldersOut.push(folderObj);

            path = '';
        }

        return foldersOut;
    }
};
