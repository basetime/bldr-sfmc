import { initiateBldrSDK } from '../../../_bldr_sdk';
import { ManifestAsset, ManifestFolder } from '../../../_types/ManifestAsset';
import { StashItem } from '../../../_types/StashItem';
import { readManifest, replaceBldrSfmcEnv } from '../../../_utils/bldrFileSystem';
import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
import { displayLine } from '../../../_utils/display';
import { createFile } from '../../../_utils/fileSystem';
import { uniqueArrayByKey } from '../../_utils';
import { addNewFolders } from '../../_utils/CreateSFMCFolders';
import { Stash } from '../stash';
import { State } from '../state';
import { setAutomationStudioDefinition } from '../_contexts/automationStudio/definitions';
import { setContentBuilderDefinition } from '../_contexts/contentBuilder/definitions';

const { getCurrentInstance, isVerbose, allowTracking, debug } = new State();
const { getStashArray, removeFromStashByBldrId, clearStash } = new Stash();

import { incrementMetric } from '../../../_utils/metrics';

export class Push {
    constructor() {}
    /**
     * Route and Push files into SFMC
     */
    pushStash = async () => {
        const instance = await getCurrentInstance();
        debug('Push Instance', 'info', instance);
        // get stash for instance for state instance
        const instanceStash: StashItem[] = await getStashArray();
        const availableContextsArray = instanceStash.map((stashItem) => {
            return stashItem.bldr.context;
        });

        const availableContexts = await uniqueArrayByKey(availableContextsArray, 'context');
        const manifestJSON = await readManifest();

        for (const context in availableContexts) {
            const currentContext = availableContexts[context].context;
            const contextStash = instanceStash.filter((stashItem) => stashItem.bldr.context.context === currentContext);
            debug(`${currentContext} Stash`, 'info', contextStash);

            isVerbose() && displayLine(`Working on ${currentContext}`, 'progress');

            const postStashFiles: StashItem[] | any[] =
                contextStash
                    .map((stashItem) => {
                        return (
                            !Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') &&
                            !Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key') &&
                            stashItem
                        );
                    })
                    .filter(Boolean) || [];

            debug(`${postStashFiles.length}  Files to be Created`, 'info', postStashFiles);

            const putStashFiles: StashItem[] | any[] =
                contextStash
                    .map(
                        (stashItem) =>
                            (Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') ||
                                Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key')) &&
                            stashItem
                    )
                    .filter(Boolean) || [];

            debug(`${putStashFiles.length} Files to be Updated`, 'info', putStashFiles);

            isVerbose() && postStashFiles.length && putStashFiles.length
                ? displayLine(`Updating and Creating assets for ${instance}`, 'info')
                : postStashFiles.length && !putStashFiles.length
                ? displayLine(`Creating assets for ${instance}`, 'info')
                : displayLine(`Updating assets for ${instance}`, 'info');

            // Retrieve Manifest JSON file and get the assets for the specific context
            const manifestContextAssets: ManifestAsset[] =
                manifestJSON[currentContext] && manifestJSON[currentContext]['assets'];

            const manifestContextFolders: ManifestFolder[] =
                (manifestJSON[currentContext] && manifestJSON[currentContext]['folders']) ||
                (manifestContextAssets && manifestContextAssets.map((asset) => asset && asset.category));

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
            isVerbose() &&
                putResults &&
                putResults.success &&
                putResults.success.length &&
                displayLine(`>> ${putResults.success.length} Assets Updated`);
            postResults &&
                postResults.success &&
                postResults.success.length &&
                displayLine(`Successfully Created Assets`, 'info');
            isVerbose() &&
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
            isVerbose() &&
                putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`Unsuccessfully Updated Assets`, 'info');
            isVerbose() &&
                putResults &&
                putResults.errors &&
                putResults.errors.length &&
                putResults.errors.forEach((result) => {
                    (typeof result !== 'string' && result.name && displayLine(result.name, 'error')) ||
                        displayLine(result, 'error');
                });
            isVerbose() &&
                putResults &&
                putResults.errors &&
                putResults.errors.length &&
                displayLine(`>> ${putResults.errors.length} Assets Errored`);
            postResults &&
                postResults.errors &&
                postResults.errors.length &&
                displayLine(`Unsuccessfully Created Assets`, 'info');

            isVerbose() &&
                postResults &&
                postResults.errors &&
                postResults.errors.length &&
                postResults.errors.forEach((result) => {
                    (typeof result !== 'string' && result.name && displayLine(result.name, 'error')) ||
                        displayLine(result, 'error');
                });
            isVerbose() &&
                postResults &&
                postResults.errors &&
                postResults.errors.length &&
                displayLine(`>> ${postResults.errors.length} Assets Errored`);

            allowTracking() && incrementMetric('req_command_push');
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

            const stashFoldersArray =
                (stashFiles &&
                    stashFiles.length &&
                    stashFiles.map((file) => {
                        return { path: file.bldr.folderPath, context: file.bldr.context };
                    })) ||
                [];
            const stashFolders = await uniqueArrayByKey(stashFoldersArray, 'path');

            for (let f = 0; f < stashFolders.length; f++) {
                await addNewFolders(sdk, stashFolders[f]);
            }

            for (let f = 0; f < stashFiles.length; f++) {
                let stashFileObject = stashFiles[f];
                const bldrId = stashFileObject.bldr.bldrId;
                const folderPath = stashFileObject.bldr && stashFileObject.bldr.folderPath;
                const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context.context;
                const method = Object.prototype.hasOwnProperty.call(stashFileObject.bldr, 'id') ? 'put' : 'post';
                let manifestJSON = await readManifest();

                let sfmcUpdateObject: any;
                let assetResponse: any;
                let sfmcAPIObject: any;

                if (method === 'put') {
                    sfmcUpdateObject = manifestContextAssets.find(
                        (manifestItem: ManifestAsset) => manifestItem.bldrId === bldrId
                    );
                    if (sfmcUpdateObject) {
                        sfmcUpdateObject.bldr = {
                            bldrId,
                        };
                    }
                } else {
                    sfmcUpdateObject = stashFileObject;
                }

                if (sfmcUpdateObject) {
                    let createdFolders;
                    let manifestContextFolders: ManifestFolder[];
                    const stashFileObjectReplaced = await replaceBldrSfmcEnv(JSON.stringify(stashFileObject));
                    stashFileObject = JSON.parse(stashFileObjectReplaced);

                    switch (stashFileContext) {
                        case 'automationStudio':
                            if (method === 'put') {
                                sfmcAPIObject =
                                    stashFileObject?.fileContent &&
                                    (await setAutomationStudioDefinition(
                                        sfmcUpdateObject,
                                        stashFileObject.fileContent
                                    ));

                                debug('Automation Studio Payload', 'info', sfmcAPIObject);
                                assetResponse = await sdk.sfmc.automation.patchAutomationAsset(sfmcAPIObject);
                                debug('Automation Studio Update', 'info', assetResponse);
                            } else {
                                const folderPath = sfmcUpdateObject.bldr.folderPath;
                                // sfmcAPIObject = stashFileObject?.post?.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject.post)
                                // assetResponse = await sdk.sfmc.automation.postAsset(sfmcAPIObject);
                            }

                            if (
                                Object.prototype.hasOwnProperty.call(assetResponse, 'key') ||
                                Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')
                            ) {
                                const objectIdKey = sfmcUpdateObject.assetType.objectIdKey;
                                sfmcAPIObject.key = assetResponse.key;
                                sfmcAPIObject[objectIdKey] = assetResponse[objectIdKey];
                                success.push(sfmcAPIObject);
                            } else {
                                assetResponse.response.data.errors &&
                                    Array.isArray(assetResponse.response.data.errors) &&
                                    assetResponse.response.data.errors.forEach((error: { message: string }) => {
                                        errors.push(error.message);
                                    });

                                // assetResponse.message && errors.push(assetResponse.message);
                            }
                            break;
                        case 'contentBuilder':
                        case 'sharedContent':
                            // createdFolders = await addNewFolders(folderPath);
                            manifestJSON = await readManifest();
                            manifestContextFolders =
                                manifestJSON[
                                    stashFileContext === 'contentBuilder' ? 'contentBuilder' : 'sharedContent'
                                ] &&
                                manifestJSON[
                                    stashFileContext === 'contentBuilder' ? 'contentBuilder' : 'sharedContent'
                                ]['folders'];

                            // Get Category Data
                            sfmcUpdateObject.category = manifestContextFolders.find(
                                (manifestFolder) => manifestFolder.folderPath === folderPath
                            );

                            // Set Asset Definition Schema
                            sfmcAPIObject = await setContentBuilderDefinition(
                                sfmcUpdateObject,
                                stashFileObject.fileContent
                            );

                            debug('Content Builder Payload', 'info', sfmcAPIObject);
                            if (method === 'put') {
                                assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                                debug('Content Builder Update', 'info', assetResponse);
                            } else {
                                assetResponse = await sdk.sfmc.asset.postAsset(sfmcAPIObject);
                                debug('Content Builder Create', 'info', assetResponse);
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
                            // createdFolders = await addNewFolders(folderPath);
                            manifestJSON = await readManifest();
                            manifestContextFolders =
                                manifestJSON['dataExtension'] && manifestJSON['dataExtension']['folders'];

                            sfmcUpdateObject.assetType = {
                                name: 'dataExtension',
                            };

                            sfmcUpdateObject.category = manifestContextFolders.find(
                                (manifestFolder) => manifestFolder.folderPath === folderPath
                            );

                            sfmcAPIObject = JSON.parse(sfmcUpdateObject.fileContent);
                            sfmcAPIObject.categoryId = sfmcUpdateObject.category.id;

                            debug('Data Extension Payload', 'info', sfmcAPIObject);
                            if (method === 'put') {
                                // assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                            } else {
                                assetResponse = await sdk.sfmc.emailStudio.postAsset(sfmcAPIObject);
                                debug('Data Extension Create', 'info', assetResponse);
                            }

                            if (
                                assetResponse.OverallStatus === 'OK' &&
                                Object.prototype.hasOwnProperty.call(assetResponse, 'Results') &&
                                Object.prototype.hasOwnProperty.call(assetResponse.Results[0], 'Object') &&
                                Object.prototype.hasOwnProperty.call(assetResponse.Results[0]['Object'], 'CustomerKey')
                            ) {
                                sfmcAPIObject.bldrId = bldrId;
                                sfmcAPIObject.customerKey = assetResponse.Results[0].Object.CustomerKey;
                                sfmcAPIObject.category = {
                                    id: sfmcUpdateObject.category.id,
                                    folderPath: sfmcUpdateObject.category.folderPath,
                                };

                                await createFile(`${folderPath}/${sfmcAPIObject.name}.json`, sfmcAPIObject);
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(sfmcAPIObject);
                            }
                            break;
                        case 'sharedDataExtension':
                            // createdFolders = await addNewFolders(folderPath);
                            manifestJSON = await readManifest();
                            manifestContextFolders =
                                manifestJSON['sharedDataExtension'] && manifestJSON['sharedDataExtension']['folders'];

                            sfmcUpdateObject.assetType = {
                                name: 'sharedDataExtension',
                            };

                            sfmcUpdateObject.category = manifestContextFolders.find(
                                (manifestFolder) => manifestFolder.folderPath === folderPath
                            );

                            sfmcAPIObject = JSON.parse(sfmcUpdateObject.fileContent);
                            sfmcAPIObject.categoryId = sfmcUpdateObject.category.id;

                            debug('Shared Data Extension Payload', 'info', sfmcAPIObject);
                            if (method === 'put') {
                                // assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                            } else {
                                assetResponse = await sdk.sfmc.emailStudio.postAsset(sfmcAPIObject);
                                debug('Shared Data Extension Update', 'info', assetResponse);
                            }

                            if (
                                assetResponse.OverallStatus === 'OK' &&
                                Object.prototype.hasOwnProperty.call(assetResponse, 'Results') &&
                                Object.prototype.hasOwnProperty.call(assetResponse.Results[0], 'Object') &&
                                Object.prototype.hasOwnProperty.call(assetResponse.Results[0]['Object'], 'CustomerKey')
                            ) {
                                sfmcAPIObject.bldrId = bldrId;
                                sfmcAPIObject.customerKey = assetResponse.Results[0].Object.CustomerKey;
                                sfmcAPIObject.category = {
                                    id: sfmcUpdateObject.category.id,
                                    folderPath: sfmcUpdateObject.category.folderPath,
                                };

                                await createFile(`${folderPath}/${sfmcAPIObject.name}.json`, sfmcAPIObject);
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(sfmcAPIObject);
                            }
                            break;
                    }

                    if (
                        assetResponse.OverallStatus === 'OK' ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'objectId') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'CustomerKey') ||
                        Object.prototype.hasOwnProperty.call(assetResponse, 'key')
                    ) {
                        await removeFromStashByBldrId(bldrId);
                    }
                }
            }

            return {
                success,
                errors,
            };
        } catch (err: any) {
            debug('Create/Update Error', 'error', err);
            console.log(err);
            if (err.JSON && err.JSON.Results && err.JSON.Results[0] && err.JSON.Results[0].StatusMessage) {
                displayLine(err.JSON.Results[0].StatusMessage, 'error');
            }

            err.errorMessage && displayLine(err.errorMessage, 'error');

            err.response.data && err.response.data.message && displayLine(err.response.data.message, 'error');
            err.response.data &&
                err.response.data.errors &&
                Array.isArray(err.response.data.errors) &&
                err.response.data.errors.forEach((error: { message: string }) => console.log(error));
            err.response.data &&
                err.response.data.validationErrors &&
                err.response.data.validationErrors.length &&
                displayLine(err.response.data.validationErrors[0].message, 'error');

            err.response.data &&
                err.response.data.validationErrors &&
                err.response.data.validationErrors.length &&
                displayLine(`ErrorCode: ${err.response.data.validationErrors[0].errorcode}`, 'error');
        }
    };
}
