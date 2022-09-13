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
import { SFMC_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/sfmc_client';
import { addNewFolders } from '../../_utils/CreateSFMCFolders';

const { getCurrentInstance, isVerbose } = new State();
const { getStashArray, removeFromStashByBldrId, clearStash } = new Stash();

export class Push {
    constructor() {}
    /**
     * Route and Push files into SFMC
     */
    pushStash = async () => {
        const instance = await getCurrentInstance();
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

            const putStashFiles: StashItem[] | any[] =
                contextStash
                    .map(
                        (stashItem) =>
                            (Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') ||
                                Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key')) &&
                            stashItem
                    )
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
                    displayLine(result.name, 'error');
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
                    displayLine(result.name, 'error');
                });
            isVerbose() &&
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

                    switch (stashFileContext) {
                        case 'automationStudio':
                            if (method === 'put') {
                                sfmcAPIObject =
                                    stashFileObject?.fileContent &&
                                    (await setAutomationStudioDefinition(
                                        sfmcUpdateObject,
                                        stashFileObject.fileContent
                                    ));
                                assetResponse = await sdk.sfmc.automation.patchAutomationAsset(sfmcAPIObject);
                            } else {
                                // sfmcAPIObject = stashFileObject?.post?.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject.post)
                                // assetResponse = await sdk.sfmc.automation.postAsset(sfmcAPIObject);
                            }

                            if (Object.prototype.hasOwnProperty.call(assetResponse, 'key')) {
                                const objectIdKey = sfmcUpdateObject.assetType.objectIdKey;
                                sfmcAPIObject.key = assetResponse.key;
                                sfmcAPIObject[objectIdKey] = assetResponse[objectIdKey];
                                success.push(sfmcAPIObject);
                            } else {
                                errors.push(assetResponse.message);
                            }
                            break;
                        case 'contentBuilder':
                            createdFolders = await addNewFolders(folderPath);
                            manifestJSON = await readManifest();
                            manifestContextFolders =
                                manifestJSON['contentBuilder'] && manifestJSON['contentBuilder']['folders'];

                            // Get Category Data
                            sfmcUpdateObject.category =
                                (createdFolders &&
                                    createdFolders.length &&
                                    createdFolders[createdFolders.length - 1]) ||
                                manifestContextFolders.find(
                                    (manifestFolder) => manifestFolder.folderPath === folderPath
                                );

                            // Set Asset Definition Schema
                            sfmcAPIObject = await setContentBuilderDefinition(
                                sfmcUpdateObject,
                                stashFileObject.fileContent
                            );

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
                            createdFolders = await addNewFolders(folderPath);
                            manifestJSON = await readManifest();
                            manifestContextFolders =
                                manifestJSON['dataExtension'] && manifestJSON['dataExtension']['folders'];

                            sfmcUpdateObject.assetType = {
                                name: 'dataExtension',
                            };

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
            console.log(err);
        }
    };
}
