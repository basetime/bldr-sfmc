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
import { setAutomationStudioDefinition } from '../_contexts/automationStudio/definitions';
const { getState, getCurrentInstance } = new State();
const { getStashArray, saveStash } = new Stash();

const unique = require('lodash.uniq')

export class Push {
    constructor() { }
    /**
     * Route and Push files into SFMC
     */
    pushStash = async () => {
        const instance = await getCurrentInstance();
        // get stash for instance for state instance
        const instanceStash: StashItem[] = await getStashArray();
        const availableContextsArray = instanceStash.map((stashItem) => {
            return stashItem.bldr.context
        })

        const availableContexts = await unique(availableContextsArray)
        const manifestJSON = await readManifest();

        for (const context in availableContexts) {
            const currentContext = availableContexts[context].context;
            const contextStash = instanceStash.filter((stashItem) => stashItem.bldr.context.context === currentContext)

            displayLine(`Working on ${currentContext}`, 'progress');

            const postStashFiles: StashItem[] | any[] =
                contextStash
                    .map((stashItem) => Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)
                    .filter(Boolean) || [];
            const putStashFiles: StashItem[] | any[] =
                contextStash
                    .map((stashItem) => !Object.prototype.hasOwnProperty.call(stashItem, 'post') && stashItem)
                    .filter(Boolean) || [];

            const pushInitMessage =
                postStashFiles.length && putStashFiles.length
                    ? displayLine(`Updating and Creating assets for ${instance}`, 'info')
                    : postStashFiles.length && !putStashFiles.length
                        ? displayLine(`Creating assets for ${instance}`, 'info')
                        : displayLine(`Updating assets for ${instance}`, 'info');

            // Retrieve Manifest JSON file and get the assets for the specific context
            const manifestContextAssets: ManifestAsset[] =
                manifestJSON[currentContext] && manifestJSON[currentContext]['assets'];

            const manifestContextFolders: ManifestFolder[] =
                manifestJSON[currentContext] && manifestJSON[currentContext]['folders'] ||
                manifestContextAssets && manifestContextAssets.map(asset => asset && asset.category);

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
                (await updateManifest(currentContext, {
                    assets: [...putResults.success],
                }));

            postResults &&
                postResults.success &&
                postResults.success.length &&
                (await updateManifest(currentContext, {
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
    };


    /**
     *
     * @param stashFiles
     * @param manifestContextAssets
     * @param manifestContextFolders
     * @returns
     */
    pushToSFMC = async (
        stashFiles: StashItem[],
        manifestContextAssets: ManifestAsset[],
        manifestContextFolders: ManifestFolder[]
    ) => {
        try {
            const sdk = await initiateBldrSDK();
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
                const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context.context;
                const method = Object.prototype.hasOwnProperty.call(stashFileObject, 'post') ? 'post' : 'put';
                let sfmcUpdateObject: any;
                let assetResponse: any;

                if (method === 'put') {
                    sfmcUpdateObject = manifestContextAssets.find(
                        (manifestItem: ManifestAsset) => manifestItem.bldrId === bldrId
                    );
                } else {
                    sfmcUpdateObject = stashFileObject && stashFileObject.post;
                }

                let sfmcAPIObject: any;
                if (sfmcUpdateObject) {
                    switch (stashFileContext) {
                        case 'automationStudio':
                            sfmcAPIObject = stashFileObject && stashFileObject.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject)

                            if (method === 'put') {
                                // erroring showing not on automation object
                                assetResponse = await sdk.sfmc.automation.patchAutomationAsset(sfmcAPIObject);

                            } else {
                                // assetResponse = await sdk.sfmc.automation.postAsset(sfmcAPIObject);
                            }

                            if (Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')) {
                                sfmcAPIObject.customerKey = assetResponse.customerKey;
                                sfmcAPIObject.id = assetResponse.id;
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(assetResponse.message);
                            }
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

                            // Set Asset Definition Schema
                            sfmcAPIObject = stashFileObject && stashFileObject.fileContent && await setContentBuilderDefinition(sfmcUpdateObject, stashFileObject);

                            if (method === 'put') {
                                assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                            } else {
                                assetResponse = await sdk.sfmc.asset.postAsset(sfmcAPIObject);
                            }

                            if (Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')) {
                                sfmcAPIObject.customerKey = assetResponse.customerKey;
                                sfmcAPIObject.id = assetResponse.id;
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(assetResponse.message);
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

}
