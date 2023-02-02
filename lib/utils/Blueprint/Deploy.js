const utils = require('../utils');
const find = require('lodash.find');

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

    async init() {
        try {
            const packageJSON = await this.localFile._getSFMCPackage();
            const contexts = this.contextMap.map((ctx) => ctx.context);

            if (await utils.deployCheckConfig()) {
                return;
            }

            for (const c in contexts) {
                const context = contexts[c];

                if (packageJSON[context]) {
                    // Update ManifestJSON file with responses
                    await this.localFile.manifestJSON(context, { folders: [] }, null);

                    await this.localFile.manifestJSON(context, { assets: [] }, null);

                    const contextDetails = this.contextMap.find((ctx) => ctx.context === context);
                    // const pkgFolders = packageJSON[context]['folders']
                    const pkgAssets = packageJSON[context]['assets'];
                    const pkgFolders = pkgAssets.map((asset) => asset.category.folderPath);

                    //Deploy all Folders
                    const createFolders = await this.deployFolders(pkgFolders, contextDetails);
                    if (createFolders.OverallStatus === 'ERROR') {
                        throw new Error(createFolders.StatusText);
                    }

                    if (
                        context === 'dataExtension' &&
                        Object.prototype.hasOwnProperty.call(packageJSON, 'dataExtension')
                    ) {
                        await this.deployDataExtensions(pkgAssets, contextDetails);
                    }

                    if (
                        context === 'contentBuilder' &&
                        Object.prototype.hasOwnProperty.call(packageJSON, 'contentBuilder')
                    ) {
                        await this.deployContentBuilderAssets(pkgAssets, contextDetails);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    async deployContentBuilderAssets(contentBuilderAssets, contextDetails) {
        try {
            //Find 0 Dependency assets
            const noDependencyAssets = contentBuilderAssets
                .map((asset) => {
                    if (!Object.prototype.hasOwnProperty.call(asset, 'dependencies')) {
                        return asset;
                    }
                })
                .filter(Boolean);

            const dependencyAssets = contentBuilderAssets
                .map((asset) => {
                    if (Object.prototype.hasOwnProperty.call(asset, 'dependencies')) {
                        return asset;
                    }
                })
                .filter(Boolean);

            for (const nd in noDependencyAssets) {
                const asset = noDependencyAssets[nd];
                await this.deployContentBuilderAsset(asset, contextDetails, false);
            }

            for (const d in dependencyAssets) {
                const depAsset = dependencyAssets[d];
                await this.deployContentBuilderAsset(depAsset, contextDetails, true);
            }
        } catch (err) {
            console.log('ERR', err);
        }
    }

    async deployContentBuilderAsset(contentBuilderAsset, contextDetails, dependencies = false) {
        const ignoreDeployment = ['webpage', 'jscoderesource'];

        const manifestJSON = await this.stash._getManifestAssetData();

        const manifestJSONFolders = manifestJSON[contextDetails.context]['folders'];

        const contentFolderPath = contentBuilderAsset.category.folderPath;

        const categoryDetails = manifestJSONFolders.find((folders) => folders.folderPath === contentFolderPath);

        //Update asset content with configurations before posting
        let content = await utils.getAssetContent(contentBuilderAsset);
        let buildContent = await utils.replaceConfig(content);
        contentBuilderAsset = await utils.updateAssetContent(contentBuilderAsset, buildContent);

        if (categoryDetails) {
            contentBuilderAsset.category = {
                id: categoryDetails.id,
            };
        }

        if (!dependencies) {
            if (
                Object.prototype.hasOwnProperty.call(contentBuilderAsset, 'assetType') &&
                Object.prototype.hasOwnProperty.call(contentBuilderAsset.assetType, 'name') &&
                ignoreDeployment.includes(contentBuilderAsset.assetType.name)
            ) {
                console.log(
                    `${contentBuilderAsset.assetType.name} asset type requires the user to create the asset manually. Create the asset, then run the [ bldr clone ] command to get the asset.`
                );
                await this.localFile.createEditableFiles([contentBuilderAsset], contextDetails.context, true);
            } else {
                const createAsset = await this.bldr.asset.postAsset(contentBuilderAsset);

                if (createAsset.status === 'ERROR') {
                    console.log(createAsset.statusText);
                } else {
                    contentBuilderAsset.id = createAsset.id;
                    contentBuilderAsset.assetType = createAsset.assetType;
                    contentBuilderAsset.category = createAsset.category;
                    contentBuilderAsset.customerKey = createAsset.customerKey;
                    contentBuilderAsset.category.folderPath = contentFolderPath;

                    // Update ManifestJSON file with r˜esponses
                    await this.localFile.manifestJSON(contextDetails.context, { assets: [contentBuilderAsset] }, null);

                    await this.localFile.createEditableFiles([contentBuilderAsset], contextDetails.context, true);
                }
            }
        } else {
            //Get assets dependencies
            const assetDependencies = contentBuilderAsset.dependencies;

            await this.updateContentBuilderReferences(contentBuilderAsset, manifestJSON, assetDependencies);

            if (
                Object.prototype.hasOwnProperty.call(contentBuilderAsset, 'assetType') &&
                Object.prototype.hasOwnProperty.call(contentBuilderAsset.assetType, 'name') &&
                ignoreDeployment.includes(contentBuilderAsset.assetType.name)
            ) {
                console.log(
                    `${contentBuilderAsset.assetType.name} asset type requires the user to create the asset manually. Create the asset, then run the [ bldr clone ] command to get the asset.`
                );
                await this.localFile.createEditableFiles([contentBuilderAsset], contextDetails.context, true);
            } else {
                const createAsset = await this.bldr.asset.postAsset(contentBuilderAsset);

                if (createAsset.status === 'ERROR') {
                    console.log(createAsset.statusText);
                } else {
                    contentBuilderAsset.id = createAsset.id;
                    contentBuilderAsset.assetType = createAsset.assetType;
                    contentBuilderAsset.category = createAsset.category;
                    contentBuilderAsset.customerKey = createAsset.customerKey;
                    contentBuilderAsset.category.folderPath = contentFolderPath;

                    // Update ManifestJSON file with responses
                    await this.localFile.manifestJSON(contextDetails.context, { assets: [contentBuilderAsset] }, null);

                    await this.localFile.createEditableFiles([contentBuilderAsset], contextDetails.context, true);
                }
            }
        }
    }

    async updateContentBuilderReferences(contentBuilderAsset, manifestJSON, assetDependencies) {
        let content = await utils.getAssetContent(contentBuilderAsset);
        let createdId;

        for (const a in assetDependencies) {
            const assetDependency = assetDependencies[a];
            const findObj = await find(manifestJSON[assetDependency.context]['assets'], (o) => {
                return o.bldrId === assetDependency.bldrId;
            });

            switch (assetDependency.ref) {
                case 'Lookup':
                case 'LookupRows':
                case 'ClaimRow':
                case 'DataExtensionRowCount':
                case 'DeleteData':
                case 'DeleteDE':
                case 'InsertDE':
                case 'UpdateData':
                case 'UpdateDE':
                case 'UpsertData':
                case 'UpsertDE':
                case 'LookupOrderedRows':
                case 'LookupOrderedRowsCS':
                case 'LookupRowsCS':
                    createdId = findObj.name;
                    break;
                case 'ContentBlockById':
                    createdId = findObj.id;
                    break;
                case 'ContentBlockByName':
                    if (
                        content.match(
                            new RegExp(`(?<=Platform.Function.ContentBlockByName\\(')${assetDependency.bldrId}`, 'g')
                        )
                    ) {
                        createdId = `${findObj.category.folderPath}/${findObj.name}`.replaceAll('/', '\\\\');
                    } else {
                        createdId = `${findObj.category.folderPath}/${findObj.name}`.replaceAll('/', '\\');
                    }
                    break;
            }

            content = content.replaceAll(assetDependency.bldrId, createdId);
        }

        return utils.updateAssetContent(contentBuilderAsset, content);
    }

    async deployDataExtensions(dataExtensions, contextDetails) {
        try {
            for (const d in dataExtensions) {
                let dataExtension = dataExtensions[d];

                const manifestJSON = await this.stash._getManifestAssetData();
                const manifestJSONFolder = manifestJSON['dataExtension']['folders'].find(
                    (manifestJSONFolderFolderObj) =>
                        manifestJSONFolderFolderObj.folderPath === dataExtension.category.folderPath
                );

                if (manifestJSONFolder) {
                    dataExtension.categoryID = manifestJSONFolder.id;
                } else {
                    delete dataExtension.category;
                }

                dataExtension.fields = dataExtension.fields.map((field) => {
                    return {
                        field: field,
                    };
                });

                const createDataExtension = await this.bldr.dataExtension.postAsset(
                    await utils.capitalizeKeys(dataExtension)
                );
                dataExtension = await utils.lowercaseKeys(dataExtension);

                if (Object.prototype.hasOwnProperty.call(dataExtension, '@_xsi:type')) {
                    delete dataExtension['@_xsi:type'];
                }

                if (
                    Object.prototype.hasOwnProperty.call(createDataExtension, 'StatusCode') &&
                    createDataExtension.StatusCode === 'Error'
                ) {
                    throw new Error(`${createDataExtension.Object.Name}: ${createDataExtension.StatusMessage}`);
                }

                // Update ManifestJSON file with responses
                await this.localFile.manifestJSON(contextDetails.context, { assets: [dataExtension] }, null);

                await this.localFile.createEditableFiles([dataExtension], contextDetails.context, true);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async deployFolders(packageFolders, contextDetails) {
        try {
            const results = new Array();
            for (const f in packageFolders) {
                const folderPath = packageFolders[f];

                const deployFolder = await this.deployFolder(folderPath, contextDetails);

                if (deployFolder.OverallStatus === 'ERROR') {
                    throw new Error(deployFolder.StatusText);
                }

                results.push(...deployFolder.Results);
            }

            return {
                OverallStatus: 'OK',
                Results: results,
            };
        } catch (err) {
            return {
                OverallStatus: 'ERROR',
                StatusText: err.message,
            };
        }
    }

    /**
     * Method to create new folders in SFMC when the do not exist
     *
     * @param {object} categoryDetails various folder/asset values from the full file path
     */
    async deployFolder(folderPath, contextDetails) {
        try {
            let categoryType = contextDetails.categoryType;
            let checkPath = contextDetails.root;
            let parentId;
            let createFolder;
            let manifestFolders = new Array();

            let pathArr = folderPath.split('/');
            pathArr.shift();

            // Iterate through all folder names to see where folders need to be created
            for (const p in pathArr) {
                const folder = pathArr[p];
                let updatedFolder = 0;

                // Compile path to check against
                checkPath = `${checkPath}/${folder}`;

                const manifestJSON = await this.stash._getManifestAssetData();
                const manifestJSONFolder = manifestJSON[contextDetails.context]['folders'].find(
                    (manifestJSONFolderFolderObj) => manifestJSONFolderFolderObj.folderPath === checkPath
                );

                if (!manifestJSONFolder) {
                    if (typeof parentId === 'undefined') {
                        const parentObj = await this.bldr.folder.search(categoryType, 'Name', contextDetails.root);

                        if (parentObj.OverallStatus !== 'OK') {
                            throw new Error(parentObj.OverallStatus);
                        }

                        if (
                            !Object.prototype.hasOwnProperty.call(parentObj, 'Results') &&
                            parentObj.Results.length > 0
                        ) {
                            throw new Error('No Results Found for Root Folder');
                        }

                        parentId = parentObj.Results[0].ID;
                    }

                    // Create folder via SFMC API
                    createFolder = await this.bldr.folder.create({
                        name: folder,
                        parentId,
                        contentType: categoryType,
                    });

                    if (createFolder.StatusCode === 'Error') {
                        throw new Error(createFolder.StatusMessage);
                    } else {
                        // Wait for response from folder creation and add object to manifestFolder array
                        // Folder permissions my not allow child folders, so when exception is thrown create will retry
                        // do/while will check until retry is done and folder is created
                        do {
                            const folderObj = {
                                id: createFolder.Results[0].NewID,
                                name: folder,
                                parentId: parentId,
                                categoryType: categoryType,
                                folderPath: checkPath,
                            };

                            // Update ManifestJSON file with responses
                            await this.localFile.manifestJSON(contextDetails.context, { folders: [folderObj] }, null);

                            parentId = createFolder.Results[0].NewID;
                            updatedFolder++;
                        } while (typeof createFolder !== 'undefined' && updatedFolder === 0);
                    }
                } else {
                    //if folder exists set it's ID as parentID for next subfolder
                    parentId = manifestJSONFolder.id;
                }
            }

            return {
                OverallStatus: 'OK',
                Results: manifestFolders,
            };
        } catch (err) {
            return {
                OverallStatus: 'ERROR',
                StatusText: err.message,
            };
        }
    }
};
