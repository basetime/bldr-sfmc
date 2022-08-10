import remove from 'lodash.remove';
import { Stash } from '../stash';
import { State } from '../state';
import { readManifest } from '../../../_utils/bldrFileSystem';
import { StashItem } from '../../../_types/StashItem';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { displayLine, displayObject } from '../../../_utils/display';
import { getFilePathDetails, uniqueArrayByKey } from '../../_utils';
import { ManifestAsset, ManifestFolder } from '../../../_types/ManifestAsset';
import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
import { setContentBuilderDefinition } from '../_contexts/contentBuilder/definitions';

const { getState, getCurrentInstance } = new State();

const { getStashArray, saveStash } = new Stash();

export class Push {
    constructor() { }

    pushStash = async () => {
        const instance = await getCurrentInstance();
        // get stash for instance for state instance
        const instanceStash: StashItem[] = await getStashArray();

        const manifestJSON = await readManifest();
        const postStashFiles: StashItem[] | any[] =
            instanceStash
                .map((stashItem) => Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)
                .filter(Boolean) || [];
        const putStashFiles: StashItem[] | any[] =
            instanceStash
                .map((stashItem) => !Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)
                .filter(Boolean) || [];

        const availableContexts = Object.keys(manifestJSON);
        // Removes the instanceDetails Key from array
        availableContexts.shift();

        // console.log('postStashFiles', postStashFiles)
        // console.log('putStashFiles', putStashFiles)

        const pushInitMessage =
            postStashFiles.length && putStashFiles.length
                ? `Updating and Creating assets for ${instance}`
                : postStashFiles.length && !putStashFiles.length
                    ? `Creating assets for ${instance}`
                    : `Updating assets for ${instance}`;

        displayLine(pushInitMessage, 'info');
        for (const context in availableContexts) {
            displayLine(`Working on ${availableContexts[context]}`, 'progress');
            // Retrieve Manifest JSON file and get the assets for the specific context
            const manifestContextAssets: ManifestAsset[] =
                manifestJSON[availableContexts[context]] && manifestJSON[availableContexts[context]]['assets'];
            const manifestContextFolders: ManifestFolder[] =
                manifestJSON[availableContexts[context]] && manifestJSON[availableContexts[context]]['folders'];

            const putResults =
                manifestContextAssets &&
                putStashFiles &&
                putStashFiles.length &&
                (await this.pushToSFMC(putStashFiles, manifestContextAssets, manifestContextFolders));

            const postResults =
                manifestContextAssets &&
                postStashFiles &&
                postStashFiles.length &&
                (await this.pushToSFMC(postStashFiles, manifestContextAssets, manifestContextFolders));

            const updatedStashArray: StashItem[] = [];
            putResults && putResults.stashFiles && updatedStashArray.push(...putResults.stashFiles);
            putResults && putResults.stashFiles && updatedStashArray.push(...putResults.stashFiles);
            postResults && postResults.stashFiles && updatedStashArray.push(...postResults.stashFiles);
            await saveStash(updatedStashArray);

            // Update manifest file with updated content/new file json
            putResults &&
                putResults.success &&
                putResults.success.length &&
                (await updateManifest(availableContexts[context], {
                    assets: [...putResults.success],
                }));

            postResults &&
                postResults.success &&
                postResults.success.length &&
                (await updateManifest(availableContexts[context], {
                    assets: [...postResults.success],
                }));

            putResults &&
                putResults.success &&
                putResults.success.length &&
                displayLine(`Successfully Updated Assets`, 'info');
            putResults &&
                putResults.success &&
                putResults.success.length &&
                putResults.success.forEach((result) => {
                    displayLine(result.name, 'success');
                });
            putResults &&
                putResults.success &&
                putResults.success.length &&
                displayLine(`>> ${putResults.success.length} Assets Updated`);
            postResults &&
                postResults.success &&
                postResults.success.length &&
                displayLine(`Successfully Created Assets`, 'info');
            postResults &&
                postResults.success &&
                postResults.success.length &&
                postResults.success.forEach((result) => {
                    displayLine(result.name, 'success');
                });
            postResults &&
                postResults.success &&
                postResults.success.length &&
                displayLine(`>> ${postResults.success.length} Assets Created`);
            putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`Unsuccessfully Updated Assets`, 'info');
            putResults &&
                putResults.errors &&
                putResults.errors.length &&
                putResults.errors.forEach((result) => {
                    displayLine(result.name, 'error');
                });
            putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`>> ${putResults.errors.length} Assets Errored`);
            postResults &&
                postResults.errors &&
                postResults.errors.length &&
                displayLine(`Unsuccessfully Created Assets`, 'info');
            postResults &&
                postResults.errors &&
                postResults.errors.length &&
                postResults.errors.forEach((result) => {
                    displayLine(result.name, 'error');
                });
            postResults &&
                postResults.errors &&
                postResults.errors.length &&
                displayLine(`>> ${postResults.errors.length} Assets Errored`);
        }
        // // get local manifest file
        // const rootPath = this.localFile._getRootPath(contextMap);
        // const manifestPath = `${rootPath}.local.manifest.json`;
        // const manifestJSON = this.localFile._parseJSON(manifestPath);
        // const contextArr = this.contextMap.map((ctx) => ctx.context);

        // for (const ctx in manifestJSON) {
        //     if (contextArr.includes(ctx)) {
        //         const manifestAssets = manifestJSON[ctx]['assets'];
        //         const postAssets = await this._isolateManifestAssetsForUpdate(
        //             manifestAssets,
        //             bldrIds
        //         );

        //         const updatedManifestAssets = await this._updateManifestAssets(
        //             postAssets,
        //             stashJSON
        //         );

        //         const newAssets = await this._isolateNewAssets(
        //             manifestAssets,
        //             stashJSON
        //         );

        //         await this.updateSFMCAssets(
        //             updatedManifestAssets,
        //             stashJSON,
        //             rootPath,
        //             ctx,
        //             instance
        //         );

        //         await this.updateSFMCAssets(
        //             newAssets,
        //             stashJSON,
        //             rootPath,
        //             ctx,
        //             instance
        //         );
        //     }
        // }
    };

    // async updateSFMCAssets(apiAssets, stashJSON, rootPath, ctx, instance) {
    //     const updatedStash = await this._postToSFMC(
    //         ctx,
    //         apiAssets,
    //         stashJSON.stash,
    //         rootPath
    //     );

    //     await this.localFile.manifestJSON(
    //         ctx,
    //         { assets: updatedStash.success },
    //         rootPath
    //     );

    //     stashJSON.stash = updatedStash.stashArr;
    //     this.store.stash.set(instance, stashJSON);

    //     if (
    //         updatedStash &&
    //         updatedStash.success &&
    //         updatedStash.success.length !== 0
    //     ) {
    //         const msg =
    //             updatedStash.method === 'POST'
    //                 ? `${ctx}: Created Assets`
    //                 : `${ctx}: Updated Assets`;

    //         const successHeaders = [
    //             new Column(`${styles.command(msg)}`, width.c3),
    //         ];

    //         const successDisplayContent = updatedStash.success.map((result) => {
    //             const name = result.name || result.Name;
    //             return [new Column(`${name}`, width.c3)];
    //         });

    //         display.render(successHeaders, successDisplayContent);
    //     }

    //     if (
    //         updatedStash &&
    //         updatedStash.errors &&
    //         updatedStash.errors.length !== 0
    //     ) {
    //         const errorsHeaders = [
    //             new Column(`${styles.error('Errored Asset')}`, width.c2),
    //             new Column(`${styles.error('Errored Message')}`, width.c2),
    //         ];

    //         const errorsDisplayContent = updatedStash.errors.map((result) => {
    //             return [
    //                 new Column(`${result.name}`, width.c2),
    //                 new Column(`${result.error}`, width.c2),
    //             ];
    //         });

    //         display.render(errorsHeaders, errorsDisplayContent);
    //     }
    // }

    pushToSFMC = async (
        stashFiles: StashItem[],
        manifestContextAssets: ManifestAsset[],
        manifestContextFolders: ManifestFolder[]
    ) => {
        try {
            displayLine('Passing files to SFMC')
            const sdk: BLDR_Client = await initiateBldrSDK();
            const success = [];
            const errors = [];

            // Throw Error if SDK Fails to Load
            if (!sdk) {
                displayLine('Unable to initiate BLDR SDK. Please review credentials and retry.', 'error');
                return;
            }

            for (const stashFile in stashFiles) {
                let stashFileObject = stashFiles[stashFile];
                const bldrId = stashFileObject.bldr.bldrId;
                const folderPath = stashFileObject.bldr && stashFileObject.bldr.folderPath;
                const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context;
                const method = Object.prototype.hasOwnProperty.call(stashFileObject, 'post') ? 'post' : 'put';
                let sfmcUpdateObject: any;
                let assetResponse: any;

                if (method === 'put') {
                    sfmcUpdateObject = manifestContextAssets.find(
                        (manifestItem: ManifestAsset) => manifestItem.bldrId === bldrId
                    );
                    sfmcUpdateObject.id = stashFileObject.bldr.id;
                } else {
                    sfmcUpdateObject = stashFileObject && stashFileObject.post;
                }

                let sfmcAPIObject: any;
                if (sfmcUpdateObject) {
                    switch (stashFileContext) {
                        case 'automationStudio':

                            console.log('push AS', sfmcUpdateObject)
                            break;
                        case 'contentBuilder':
                            const createdFolders = await this.addNewFolders(folderPath);
                            // Get Category Data
                            sfmcUpdateObject.category =
                                (createdFolders &&
                                    createdFolders.length &&
                                    createdFolders[createdFolders.length - 1]) ||
                                manifestContextFolders.find(
                                    (manifestFolder) => manifestFolder.folderPath === folderPath
                                );

                            console.log('sfmcUpdateObject in push fn', sfmcUpdateObject)
                            // Set Asset Definition Schema
                            sfmcAPIObject = await setContentBuilderDefinition(sfmcUpdateObject);

                            if (method === 'put') {
                                await displayLine(`Updating ${sfmcUpdateObject.name}`, 'progress');
                                assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                            } else {
                                await displayLine(`Creating ${sfmcUpdateObject.name}`, 'progress');
                                assetResponse = await sdk.sfmc.asset.postAsset(sfmcAPIObject);
                            }

                            if (Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')) {
                                sfmcAPIObject.customerKey = assetResponse.customerKey;
                                sfmcAPIObject.id = assetResponse.id;
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(assetResponse);
                            }
                            break;
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(assetResponse, 'objectId') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')
                    ) {
                        await remove(stashFiles, (item: any) => item.bldr.bldrId === bldrId);
                        await saveStash(stashFiles);
                    }
                }
            }

            return {
                stashFiles,
                success,
                errors,
            };
        } catch (err: any) {
            console.log(err);
            displayObject(err);
        }
    };

    /**
     * Method to create new folders in SFMC when the do not exist
     *
     * @param {object} categoryDetails various folder/asset values from the full file path
     * @param {string} dirPath project root folder
     */
    addNewFolders = async (stashItemFolderPath: string) => {
        try {
            displayLine('Checking for new folders', 'info');

            let createdFolderCount = 0;

            const sdk = await initiateBldrSDK();
            const { context } = await getFilePathDetails(stashItemFolderPath);
            // Split path into array to check each individually
            const stashItemFolderArray = stashItemFolderPath.split('/');
            // Grab root folder from path
            const rootContextFolder = stashItemFolderArray.shift();

            // Get .local.manifest.json file
            const manifestJSON = await readManifest();
            const manifestAssetCategories = manifestJSON[context.context]['assets'].map(
                (manifestAsset: { category: { folderPath: string } }) => manifestAsset && manifestAsset.category
            );
            const manifestFolderCategories = manifestJSON[context.context]['folders'].map(
                (manifestFolder: { folderPath: string }) => manifestFolder
            );
            const manifestFolders = await uniqueArrayByKey(
                [...manifestAssetCategories, ...manifestFolderCategories],
                'folderPath'
            );
            const createdFoldersOutput: any[] = [];

            let checkPath = rootContextFolder;
            let parentId;
            let createFolder;
            // Iterate through all folder names to see where folders need to be created
            for (const stashItemFolder in stashItemFolderArray) {
                const folder = stashItemFolderArray[stashItemFolder];
                let updatedFolder = 0;

                // Compile path to check against
                checkPath = `${checkPath}/${folder}`;

                // Check if folder path exists in .local.manifest.json
                const folderIndex = manifestFolders.findIndex(
                    (manifestFolder: { folderPath: string }) =>
                        checkPath && manifestFolder.folderPath.includes(checkPath)
                );

                // If folder does not exist
                if (folderIndex === -1) {
                    if (typeof parentId === 'undefined') {
                        const parentFolderResponse = await sdk.sfmc.folder.search({
                            contentType: context.contentType,
                            searchKey: 'Name',
                            searchTerm: context.name,
                        });

                        if (parentFolderResponse.OverallStatus !== 'OK') {
                            throw new Error(parentFolderResponse.OverallStatus);
                        }

                        if (
                            !Object.prototype.hasOwnProperty.call(parentFolderResponse, 'Results') &&
                            parentFolderResponse.Results.length > 0
                        ) {
                            throw new Error('No Results Found for Root Folder');
                        }

                        parentId = parentFolderResponse.Results[0].ID;
                    }

                    // Create folder via SFMC API
                    createFolder = await sdk.sfmc.folder.createFolder({
                        contentType: context.contentType,
                        name: folder,
                        parentId,
                    });

                    if (createFolder.StatusCode === 'Error') {
                        throw new Error(createFolder.StatusMessage);
                    } else {
                        // Wait for response from folder creation and add object to manifestFolder array
                        // Folder permissions my not allow child folders, so when exception is thrown create will retry
                        // do/while will check until retry is done and folder is created
                        do {
                            const newFolderId =
                                (createFolder && createFolder.Results && createFolder.Results[0].NewID) || null;

                            if (newFolderId) {
                                displayLine(`${folder} has been created; CategoryId: ${newFolderId}`, 'success');

                                const createdFolderObject = {
                                    id: newFolderId,
                                    name: folder,
                                    parentId,
                                    folderPath: checkPath,
                                };

                                await updateManifest(context.context, { folders: [createdFolderObject] });

                                parentId = createFolder && createFolder.Results && createFolder.Results[0].NewID;
                                createdFoldersOutput.push(createdFolderObject);
                                createdFolderCount++;
                            }

                            updatedFolder++;
                        } while (typeof createFolder !== 'undefined' && updatedFolder === 0);
                    }
                } else {
                    parentId = manifestFolders[folderIndex].id;
                }
            }

            displayLine(`>> ${createdFolderCount} folders created`);
            return createdFoldersOutput;
        } catch (err: any) {
            console.log(err);
            console.log(err.message);
        }
    };
    // async _updateManifestAssets(postAssets, stashJSON) {
    //     const updates = postAssets.map((asset) => {
    //         const assetBldrId = asset.bldrId;
    //         const stashFile = stashJSON.stash.find((stashItem) => {
    //             return stashItem.bldr.bldrId === assetBldrId;
    //         });

    //         let updatedFile = stashFile.fileContent;
    //         const assetType = asset.assetType.name;

    //         switch (assetType) {
    //             case 'webpage':
    //             case 'htmlemail':
    //                 asset.views.html.content = updatedFile;
    //                 break;
    //             case 'codesnippetblock':
    //             case 'htmlblock':
    //             case 'jscoderesource':
    //                 asset.content = updatedFile;
    //                 break;
    //             case 'textonlyemail':
    //                 asset.views.text.content = updatedFile;
    //                 break;
    //             case 'queryactivity':
    //                 asset.queryText = updatedFile;
    //                 break;
    //             case 'ssjsactivity':
    //                 asset.script = updatedFile;
    //                 break;
    //             default:
    //                 asset = JSON.parse(updatedFile);
    //         }

    //         if (Object.prototype.hasOwnProperty.call(asset, 'create')) {
    //             delete asset.create;
    //         }

    //         return asset;
    //     });

    //     return updates;
    // }

    // _isolateManifestAssetsForUpdate(manifestAssets, bldrIds) {
    //     // isolate post assets
    //     const postAssets = manifestAssets.map((asset) => {
    //         const bldrId = asset.bldrId;
    //         if (bldrIds.includes(bldrId)) return asset;
    //     });

    //     return postAssets.filter(Boolean);
    // }

    // _isolateNewAssets(manifestAssets, stashJSON) {
    //     const postAssets = stashJSON.stash.map((stashItem) => {
    //         return (
    //             Object.prototype.hasOwnProperty.call(stashItem, 'create') &&
    //             stashItem.create &&
    //             stashItem.post
    //         );
    //     });

    //     return postAssets.filter(Boolean);
    // }
}
