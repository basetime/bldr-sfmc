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
import { createFile } from '../../../_utils/fileSystem';

const { getCurrentInstance, isVerbose } = new State();
const { getStashArray, removeFromStashByBldrId, clearStash } = new Stash();

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

        const availableContexts = await uniqueArrayByKey(availableContextsArray, 'context')
        const manifestJSON = await readManifest();

        for (const context in availableContexts) {
            const currentContext = availableContexts[context].context;
            const contextStash = instanceStash.filter((stashItem) => stashItem.bldr.context.context === currentContext)

            isVerbose() && displayLine(`Working on ${currentContext}`, 'progress');

            const postStashFiles: StashItem[] | any[] =
                contextStash
                    .map((stashItem) => {

                        return (
                            !Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') &&
                            !Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key')
                        ) && stashItem
                    })
                    .filter(Boolean) || [];

            const putStashFiles: StashItem[] | any[] =
                contextStash
                    .map((stashItem) => (
                        Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') ||
                        Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key')
                    ) && stashItem)
                    .filter(Boolean) || [];


            isVerbose() && postStashFiles.length && putStashFiles.length
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
            isVerbose() && putResults &&
                putResults.success &&
                putResults.success.length &&
                displayLine(`>> ${putResults.success.length} Assets Updated`);
            postResults &&
                postResults.success &&
                postResults.success.length &&
                displayLine(`Successfully Created Assets`, 'info');
            isVerbose() && postResults &&
                postResults.success &&
                postResults.success.length &&
                postResults.success.forEach((result) => {
                    displayLine(result.name, 'success');
                });
            postResults &&
                postResults.success &&
                postResults.success.length &&
                displayLine(`>> ${postResults.success.length} Assets Created`);
            isVerbose() && putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`Unsuccessfully Updated Assets`, 'info');
            isVerbose() && putResults &&
                putResults.errors &&
                putResults.errors.length &&
                putResults.errors.forEach((result) => {
                    displayLine(result.name, 'error');
                });
            isVerbose() && putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`>> ${putResults.errors.length} Assets Errored`);
            postResults &&
                postResults.errors &&
                postResults.errors.length &&
                displayLine(`Unsuccessfully Created Assets`, 'info');
            isVerbose() && postResults &&
                postResults.errors &&
                postResults.errors.length &&
                postResults.errors.forEach((result) => {
                    displayLine(result.name, 'error');
                });
            isVerbose() && postResults &&
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

            for (let f = 0; f < stashFiles.length; f++) {
                let stashFileObject = stashFiles[f];
                const bldrId = stashFileObject.bldr.bldrId;
                const folderPath = stashFileObject.bldr && stashFileObject.bldr.folderPath;
                const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context.context;
                const method = Object.prototype.hasOwnProperty.call(stashFileObject.bldr, 'id') ? 'put' : 'post';

                const manifestJSON = await readManifest();

                let sfmcUpdateObject: any;
                let assetResponse: any;
                let sfmcAPIObject: any;

                if (method === 'put') {
                    sfmcUpdateObject = manifestContextAssets.find(
                        (manifestItem: ManifestAsset) => manifestItem.bldrId === bldrId
                    );
                    if (sfmcUpdateObject) {
                        sfmcUpdateObject.bldr = {
                            bldrId
                        }
                    }
                } else {
                    sfmcUpdateObject = stashFileObject;
                }

                if (sfmcUpdateObject) {
                    let createdFolders;
                    let manifestContextFolders: ManifestFolder[];

                    switch (stashFileContext) {
                        case 'automationStudio':

                            if (method === 'put') {
                                sfmcAPIObject = stashFileObject?.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject.fileContent)
                                assetResponse = await sdk.sfmc.automation.patchAutomationAsset(sfmcAPIObject);
                            } else {
                                // sfmcAPIObject = stashFileObject?.post?.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject.post)
                                // assetResponse = await sdk.sfmc.automation.postAsset(sfmcAPIObject);
                            }

                            if (
                                Object.prototype.hasOwnProperty.call(assetResponse, 'key')
                            ) {
                                const objectIdKey = sfmcUpdateObject.assetType.objectIdKey;
                                sfmcAPIObject.key = assetResponse.key;
                                sfmcAPIObject[objectIdKey] = assetResponse[objectIdKey];
                                success.push(sfmcAPIObject)
                            } else {
                                errors.push(assetResponse.message);
                            }
                            break;
                        case 'contentBuilder':
                            createdFolders = await this.addNewFolders(folderPath);
                            manifestContextFolders = manifestJSON['contentBuilder'] && manifestJSON['contentBuilder']['folders']

                            if (typeof createdFolders === 'string' && createdFolders.includes("Please select a different Name.")) {
                                await displayLine(createdFolders, 'error');
                                await displayLine('Clearing out the stash files', 'progress');
                                await clearStash();
                                await displayLine(`Please rename the folder and update the stash with [bldr add .]`, 'info');
                                return
                            }

                            // Get Category Data
                            sfmcUpdateObject.category =
                                (createdFolders &&
                                    createdFolders.length &&
                                    createdFolders[createdFolders.length - 1]) ||
                                manifestContextFolders.find(
                                    (manifestFolder) => manifestFolder.folderPath === folderPath
                                );

                            // Set Asset Definition Schema
                            sfmcAPIObject = await setContentBuilderDefinition(sfmcUpdateObject, stashFileObject.fileContent);

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
                                errors.push(sfmcAPIObject);
                            }
                            break;


                        case 'dataExtension':
                            createdFolders = await this.addNewFolders(folderPath);
                            manifestContextFolders = manifestJSON['dataExtension'] && manifestJSON['dataExtension']['folders']

                            if (typeof createdFolders === 'string' && createdFolders.includes("Please select a different Name.")) {
                                await displayLine(createdFolders, 'error');
                                await displayLine('Clearing out the stash files', 'progress');
                                await clearStash();
                                await displayLine(`Please rename the folder and update the stash with [bldr add .]`, 'info');
                                return
                            }

                            sfmcUpdateObject.assetType = {
                                name: 'dataExtension'
                            }

                            sfmcUpdateObject.category =
                                (createdFolders &&
                                    createdFolders.length &&
                                    createdFolders[createdFolders.length - 1]) ||
                                manifestContextFolders.find(
                                    (manifestFolder) => manifestFolder.folderPath === folderPath
                                );

                            sfmcAPIObject = JSON.parse(sfmcUpdateObject.fileContent);
                            sfmcAPIObject.categoryId = sfmcUpdateObject.category.id;

                            if (method === 'put') {
                                // assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                            } else {
                                assetResponse = await sdk.sfmc.emailStudio.postAsset(sfmcAPIObject);
                            }

                            if (
                                assetResponse.OverallStatus === 'OK'
                                && Object.prototype.hasOwnProperty.call(assetResponse, 'Results')
                                && Object.prototype.hasOwnProperty.call(assetResponse.Results[0], 'Object')
                                && Object.prototype.hasOwnProperty.call(assetResponse.Results[0]['Object'], 'CustomerKey')
                            ) {
                                sfmcAPIObject.bldrId = bldrId;
                                sfmcAPIObject.customerKey = assetResponse.Results[0].Object.CustomerKey;
                                sfmcAPIObject.category = {
                                    id: sfmcUpdateObject.category.id,
                                    folderPath: sfmcUpdateObject.category.folderPath
                                };

                                await createFile(`${folderPath}/${sfmcAPIObject.name}.json`, sfmcAPIObject)
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(sfmcAPIObject);
                            }
                            break
                    }

                    if (
                        assetResponse.OverallStatus === 'OK' ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'objectId') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'CustomerKey') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'key')
                    ) {
                        await removeFromStashByBldrId(bldrId)
                    }
                }
            }

            return {
                success,
                errors,
            };
        } catch (err: any) {
            console.log(err)
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

                        const parentFolderObject = {
                            id: parentId,
                            name: context.name,
                            parentId: parentFolderResponse.Results[0].ParentFolder.ID,
                            folderPath: context.name,
                        };

                        await updateManifest(context.context, { folders: [parentFolderObject] });

                    }

                    // Create folder via SFMC API
                    createFolder = await sdk.sfmc.folder.createFolder({
                        contentType: context.contentType,
                        name: folder,
                        parentId,
                    });

                    if (typeof createFolder === 'string' && createFolder.includes("Please select a different Name.")) {
                        throw new Error(createFolder);
                    } else {
                        // Wait for response from folder creation and add object to manifestFolder array
                        // Folder permissions my not allow child folders, so when exception is thrown create will retry
                        // do/while will check until retry is done and folder is created
                        do {
                            const newFolderId =
                                (createFolder && createFolder.Results && createFolder.Results[0].NewID) || null;

                            if (newFolderId) {
                                isVerbose() && displayLine(`${folder} has been created; CategoryId: ${newFolderId}`, 'success');
                                !isVerbose() && displayLine(`${folder} has been created`, 'success')

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

            isVerbose() && createdFolderCount > 0 && displayLine(`>> ${createdFolderCount} folders created`);
            return createdFoldersOutput;
        } catch (err: any) {
            return err.message
        }
    };

}
