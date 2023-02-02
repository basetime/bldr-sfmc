const utils = require('../../../utils');
const Column = require('../../../help/Column');
const display = require('../../../displayStyles');
const { styles, width } = display.init();

/**
 * Handle all Folder clone requests
 * Interacts with SFMC API via sfmc-api-wrapper lib
 */
module.exports = class ASClone {
    constructor(bldr, cb_clone, localFile, contextMap, store) {
        this.bldr = bldr;
        this.cb_clone = cb_clone;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
    }

    /**
     * Gathers and formats all assets from targeted SFMC CategoryID
     *
     * @param {String} argv user input from CLI
     * @param {String} context provided context from contextSwitch
     */
    async cloneAutomationsFromFolder(argv, context) {
        try {
            const id = argv.f;
            // Get all subfolder data staring with a root Id provided by the user
            const folderPaths = await this.getFoldersRecursiveDESC(id);

            // Check to ensure we have results
            if (folderPaths.length === 0) throw new Error(`No Folder Paths Found for ${styles.detail(id)}`);

            // Isolate all returned folder Ids for get asset filter
            const folderIds = await folderPaths.map(({ id }) => id);

            // Get all Content Builder assets via SFMC API based on the isolated folderIds Array
            const assetsResp = await this.bldr.automation.getByFolderArray(folderIds, this.cb_clone);

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
            await this.localFile.manifestJSON('automationStudio', { folders: folderPaths }, null);

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON('automationStudio', { assets: assetsPost }, null);
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
    async cloneAutomationsFromID(id) {
        try {
            // Get Content builder asset by id
            const assetResp = await this.bldr.automation.getById(id, this.cb_clone);

            // ensure there are results
            if (
                Object.prototype.hasOwnProperty.call(assetResp, 'response') &&
                Object.prototype.hasOwnProperty.call(assetResp.response, 'status') &&
                assetResp.response.status === 404
            ) {
                throw new Error(`No Asset Found for ID ${id}`);
            }

            const folderPaths = new Array();
            const assets = assetResp.items;

            for (const a in assets) {
                const asset = assets[a];
                const assetType = asset.assetType && asset.assetType.name;
                let folderObj;

                if (folderObj) {
                    let folderResp = await this.bldr.folder.get(assetType, asset.categoryId, false);

                    folderObj = await this._formatFolderResponse(folderResp.Results, asset.categoryId);

                    // Build full folderPath
                    const folderPath = await this.setFolderPathRecursiveAsc(folderObj[0]);

                    assets[a].folderPath = folderPath;
                    folderPaths.push(...folderObj);
                } else {
                    assets[a].folderPath = asset.assetType && asset.assetType.folder;
                }
            }

            // Format asset Object for SFMC POST/PUT and file write
            const assetsPost = await this._formatDataForFile(assets, folderPaths);

            // Create all gathered folders and assets locally
            await this.localFile.createEditableFiles(assetsPost, 'automationStudio');

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON(
                'automationStudio',
                { folders: utils.uniqueArray(folderPaths, 'id') },
                null
            );

            await this.localFile.manifestJSON('automationStudio', { assets: assetsPost }, null);
        } catch (err) {
            const displayContent = [[new Column(`${styles.callout(err.message)}`, width.c3)]];

            display.render([], displayContent);
        }
    }

    /**
     *
     * @param {String} id Automation Activity ID
     */
    async cloneAutomationActivityFromID(assetType, id) {
        try {
            let assetResp = await this.bldr.automation.getAutomationActivity(assetType, id);
            assetResp.assetType = await utils.identifyAutomationStudioActivityObjectTypeId(assetType);
            const folderPaths = new Array();
            const assets = new Array(assetResp);

            for (const a in assets) {
                const asset = assets[a];
                const assetType = asset.assetType && asset.assetType.name;
                let folderObj;

                if (folderObj) {
                    let folderResp = await this.bldr.folder.get(assetType, asset.categoryId, false);

                    folderObj = await this._formatFolderResponse(folderResp.Results, asset.categoryId);

                    // Build full folderPath
                    const folderPath = await this.setFolderPathRecursiveAsc(folderObj[0]);

                    assets[a].folderPath = folderPath;
                    folderPaths.push(...folderObj);
                } else {
                    assets[a].folderPath = asset.assetType && asset.assetType.folder;
                }
            }

            // Format asset Object for SFMC POST/PUT and file write
            const assetsPost = await this._formatDataForFile(assets, folderPaths);

            // Create all gathered folders and assets locally
            await this.localFile.createEditableFiles(assetsPost, 'automationStudio');

            // Update ManifestJSON file with responses
            await this.localFile.manifestJSON(
                'automationStudio',
                { folders: utils.uniqueArray(folderPaths, 'id') },
                null
            );

            await this.localFile.manifestJSON('automationStudio', { assets: assetsPost }, null);
        } catch (err) {
            console.error(err);
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

                const searchPath = folderPaths.find(({ id }) => id === asset.categoryId);

                const folderPath =
                    (searchPath && searchPath.folderPath) || (asset.assetType && asset.assetType.folder) || '';

                // Create JSON structure for new asset post
                let post = asset;
                post.bldrId = bldrId;
                post.folderPath = folderPath;

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

        if (parentId === 0) return path;

        do {
            const folderResp = await this.bldr.folder.get('automations', parentId, false);

            const results = folderResp.Results[0];
            parentId = results.ParentFolder.ID;
            path = `${results.Name}/${path}`;
        } while (parentId !== 0);

        return path;
    }

    /**
     * Method to gather and format all SFMC Folders recursively
     *
     * @param {integer} id
     * @returns
     */
    async getFoldersRecursiveDESC(id) {
        try {
            let folders = [];
            let foldersOut = [];

            // Get target folder from SFMC
            let rootResp = await this.bldr.folder.get('automations', id, false);

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
                let resp = await this.bldr.folder.get('automations', folderId, true);
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
            return this._formatFolderPaths(foldersOut);
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
                return {
                    id: folder.ID,
                    name: folder.Name,
                    parentId: folder.ParentFolder.ID,
                    categoryType: folder.ContentType,
                    rootFolder: id === folder.ID ? true : false,
                };
            });

            return map;
        }

        return [];
    }

    /**
     * Method to compile all full folder paths for each folder object
     *
     * @param {object} folders Array of folder objects for local config files
     * @returns
     */
    async _formatFolderPaths(folders) {
        const foldersOut = [];
        let path = 'Automation Studio';
        let parentId;
        let hasParent;

        for (const f in folders) {
            let folderObj = folders[f];
            let parentFolder;

            // If folder is rootFolder make API call to get the SFMC Top Level Folder
            if (folderObj.rootFolder === true) {
                let parentResp = await this.bldr.folder.get('automations', folderObj.parentId, false);
                parentResp = await this._formatFolderResponse(parentResp.Results, folderObj.parentId);
                path += `/${parentResp[0].name}/${folderObj.name}`;
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
