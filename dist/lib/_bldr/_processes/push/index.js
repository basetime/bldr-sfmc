"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Push = void 0;
const _bldr_sdk_1 = require("../../../_bldr_sdk");
const bldrFileSystem_1 = require("../../../_utils/bldrFileSystem");
const manifestJSON_1 = require("../../../_utils/bldrFileSystem/manifestJSON");
const display_1 = require("../../../_utils/display");
const fileSystem_1 = require("../../../_utils/fileSystem");
const _utils_1 = require("../../_utils");
const CreateSFMCFolders_1 = require("../../_utils/CreateSFMCFolders");
const stash_1 = require("../stash");
const state_1 = require("../state");
const definitions_1 = require("../_contexts/automationStudio/definitions");
const definitions_2 = require("../_contexts/contentBuilder/definitions");
const { getCurrentInstance, isVerbose, allowTracking, debug } = new state_1.State();
const { getStashArray, removeFromStashByBldrId, clearStash } = new stash_1.Stash();
const metrics_1 = require("../../../_utils/metrics");
class Push {
    constructor() {
        /**
         * Route and Push files into SFMC
         */
        this.pushStash = () => __awaiter(this, void 0, void 0, function* () {
            const instance = yield getCurrentInstance();
            debug('Push Instance', 'info', instance);
            // get stash for instance for state instance
            const instanceStash = yield getStashArray();
            const availableContextsArray = instanceStash.map((stashItem) => {
                return stashItem.bldr.context;
            });
            const availableContexts = yield (0, _utils_1.uniqueArrayByKey)(availableContextsArray, 'context');
            const manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
            for (const context in availableContexts) {
                const currentContext = availableContexts[context].context;
                const contextStash = instanceStash.filter((stashItem) => stashItem.bldr.context.context === currentContext);
                debug(`${currentContext} Stash`, 'info', contextStash);
                isVerbose() && (0, display_1.displayLine)(`Working on ${currentContext}`, 'progress');
                const postStashFiles = contextStash
                    .map((stashItem) => {
                    return (!Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') &&
                        !Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key') &&
                        stashItem);
                })
                    .filter(Boolean) || [];
                debug(`${postStashFiles.length}  Files to be Created`, 'info', postStashFiles);
                const putStashFiles = contextStash
                    .map((stashItem) => (Object.prototype.hasOwnProperty.call(stashItem.bldr, 'id') ||
                    Object.prototype.hasOwnProperty.call(stashItem.bldr, 'key')) &&
                    stashItem)
                    .filter(Boolean) || [];
                debug(`${putStashFiles.length} Files to be Updated`, 'info', putStashFiles);
                isVerbose() && postStashFiles.length && putStashFiles.length
                    ? (0, display_1.displayLine)(`Updating and Creating assets for ${instance}`, 'info')
                    : postStashFiles.length && !putStashFiles.length
                        ? (0, display_1.displayLine)(`Creating assets for ${instance}`, 'info')
                        : (0, display_1.displayLine)(`Updating assets for ${instance}`, 'info');
                // Retrieve Manifest JSON file and get the assets for the specific context
                const manifestContextAssets = manifestJSON[currentContext] && manifestJSON[currentContext]['assets'];
                const manifestContextFolders = (manifestJSON[currentContext] && manifestJSON[currentContext]['folders']) ||
                    (manifestContextAssets && manifestContextAssets.map((asset) => asset && asset.category));
                const putResults = manifestContextAssets &&
                    putStashFiles &&
                    putStashFiles.length &&
                    (yield this.pushToSFMC(putStashFiles, manifestContextAssets, manifestContextFolders));
                const postResults = manifestContextAssets &&
                    postStashFiles &&
                    postStashFiles.length &&
                    (yield this.pushToSFMC(postStashFiles, manifestContextAssets, manifestContextFolders));
                // Update manifest file with updated content/new file json
                putResults &&
                    putResults.success &&
                    putResults.success.length &&
                    (yield (0, manifestJSON_1.updateManifest)(currentContext, {
                        assets: [...putResults.success],
                    }));
                postResults &&
                    postResults.success &&
                    postResults.success.length &&
                    (yield (0, manifestJSON_1.updateManifest)(currentContext, {
                        assets: [...postResults.success],
                    }));
                putResults &&
                    putResults.success &&
                    putResults.success.length &&
                    (0, display_1.displayLine)(`Successfully Updated Assets`, 'info');
                putResults &&
                    putResults.success &&
                    putResults.success.length &&
                    putResults.success.forEach((result) => {
                        (0, display_1.displayLine)(result.name, 'success');
                    });
                isVerbose() &&
                    putResults &&
                    putResults.success &&
                    putResults.success.length &&
                    (0, display_1.displayLine)(`>> ${putResults.success.length} Assets Updated`);
                postResults &&
                    postResults.success &&
                    postResults.success.length &&
                    (0, display_1.displayLine)(`Successfully Created Assets`, 'info');
                isVerbose() &&
                    postResults &&
                    postResults.success &&
                    postResults.success.length &&
                    postResults.success.forEach((result) => {
                        (0, display_1.displayLine)(result.name, 'success');
                    });
                postResults &&
                    postResults.success &&
                    postResults.success.length &&
                    (0, display_1.displayLine)(`>> ${postResults.success.length} Assets Created`);
                isVerbose() &&
                    putResults &&
                    putResults.errors &&
                    putResults.errors.length &&
                    (0, display_1.displayLine)(`Unsuccessfully Updated Assets`, 'info');
                isVerbose() &&
                    putResults &&
                    putResults.errors &&
                    putResults.errors.length &&
                    putResults.errors.forEach((result) => {
                        (typeof result !== 'string' && result.name && (0, display_1.displayLine)(result.name, 'error')) ||
                            (0, display_1.displayLine)(result, 'error');
                    });
                isVerbose() &&
                    putResults &&
                    putResults.errors &&
                    putResults.errors.length &&
                    (0, display_1.displayLine)(`>> ${putResults.errors.length} Assets Errored`);
                postResults &&
                    postResults.errors &&
                    postResults.errors.length &&
                    (0, display_1.displayLine)(`Unsuccessfully Created Assets`, 'info');
                isVerbose() &&
                    postResults &&
                    postResults.errors &&
                    postResults.errors.length &&
                    postResults.errors.forEach((result) => {
                        (typeof result !== 'string' && result.name && (0, display_1.displayLine)(result.name, 'error')) ||
                            (0, display_1.displayLine)(result, 'error');
                    });
                isVerbose() &&
                    postResults &&
                    postResults.errors &&
                    postResults.errors.length &&
                    (0, display_1.displayLine)(`>> ${postResults.errors.length} Assets Errored`);
                allowTracking() && (0, metrics_1.incrementMetric)('req_command_push');
            }
        });
        /**
         *
         * @param stashFiles
         * @param manifestContextAssets
         * @param manifestContextFolders
         * @returns
         */
        this.pushToSFMC = (stashFiles, manifestContextAssets, manifestContextFolders) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sdk = yield (0, _bldr_sdk_1.initiateBldrSDK)();
                const success = [];
                const errors = [];
                // Throw Error if SDK Fails to Load
                if (!sdk) {
                    (0, display_1.displayLine)('Unable to initiate BLDR SDK. Please review credentials and retry.', 'error');
                    return;
                }
                const stashFoldersArray = (stashFiles &&
                    stashFiles.length &&
                    stashFiles.map((file) => {
                        return { path: file.bldr.folderPath, context: file.bldr.context };
                    })) ||
                    [];
                const stashFolders = yield (0, _utils_1.uniqueArrayByKey)(stashFoldersArray, 'path');
                for (let f = 0; f < stashFolders.length; f++) {
                    yield (0, CreateSFMCFolders_1.addNewFolders)(sdk, stashFolders[f]);
                }
                for (let f = 0; f < stashFiles.length; f++) {
                    let stashFileObject = stashFiles[f];
                    const bldrId = stashFileObject.bldr.bldrId;
                    const folderPath = stashFileObject.bldr && stashFileObject.bldr.folderPath;
                    const stashFileContext = stashFileObject.bldr && stashFileObject.bldr.context.context;
                    const method = Object.prototype.hasOwnProperty.call(stashFileObject.bldr, 'id') ? 'put' : 'post';
                    let manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
                    let sfmcUpdateObject;
                    let assetResponse;
                    let sfmcAPIObject;
                    if (method === 'put') {
                        sfmcUpdateObject = manifestContextAssets.find((manifestItem) => manifestItem.bldrId === bldrId);
                        if (sfmcUpdateObject) {
                            sfmcUpdateObject.bldr = {
                                bldrId,
                            };
                        }
                    }
                    else {
                        sfmcUpdateObject = stashFileObject;
                    }
                    if (sfmcUpdateObject) {
                        let createdFolders;
                        let manifestContextFolders;
                        const stashFileObjectReplaced = yield (0, bldrFileSystem_1.replaceBldrSfmcEnv)(JSON.stringify(stashFileObject));
                        stashFileObject = JSON.parse(stashFileObjectReplaced);
                        switch (stashFileContext) {
                            case 'automationStudio':
                                if (method === 'put') {
                                    sfmcAPIObject =
                                        (stashFileObject === null || stashFileObject === void 0 ? void 0 : stashFileObject.fileContent) &&
                                            (yield (0, definitions_1.setAutomationStudioDefinition)(sfmcUpdateObject, stashFileObject.fileContent));
                                    debug('Automation Studio Payload', 'info', sfmcAPIObject);
                                    assetResponse = yield sdk.sfmc.automation.patchAutomationAsset(sfmcAPIObject);
                                    debug('Automation Studio Update', 'info', assetResponse);
                                }
                                else {
                                    const folderPath = sfmcUpdateObject.bldr.folderPath;
                                    // sfmcAPIObject = stashFileObject?.post?.fileContent && await setAutomationStudioDefinition(sfmcUpdateObject, stashFileObject.post)
                                    // assetResponse = await sdk.sfmc.automation.postAsset(sfmcAPIObject);
                                }
                                if (Object.prototype.hasOwnProperty.call(assetResponse, 'key') ||
                                    Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')) {
                                    const objectIdKey = sfmcUpdateObject.assetType.objectIdKey;
                                    sfmcAPIObject.key = assetResponse.key;
                                    sfmcAPIObject[objectIdKey] = assetResponse[objectIdKey];
                                    success.push(sfmcAPIObject);
                                }
                                else {
                                    assetResponse.response.data.errors &&
                                        Array.isArray(assetResponse.response.data.errors) &&
                                        assetResponse.response.data.errors.forEach((error) => {
                                            errors.push(error.message);
                                        });
                                    // assetResponse.message && errors.push(assetResponse.message);
                                }
                                break;
                            case 'contentBuilder':
                            case 'sharedContent':
                                // createdFolders = await addNewFolders(folderPath);
                                manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
                                manifestContextFolders =
                                    manifestJSON[stashFileContext === 'contentBuilder' ? 'contentBuilder' : 'sharedContent'] &&
                                        manifestJSON[stashFileContext === 'contentBuilder' ? 'contentBuilder' : 'sharedContent']['folders'];
                                // Get Category Data
                                sfmcUpdateObject.category = manifestContextFolders.find((manifestFolder) => manifestFolder.folderPath === folderPath);
                                // Set Asset Definition Schema
                                sfmcAPIObject = yield (0, definitions_2.setContentBuilderDefinition)(sfmcUpdateObject, stashFileObject.fileContent);
                                debug('Content Builder Payload', 'info', sfmcAPIObject);
                                if (method === 'put') {
                                    assetResponse = yield sdk.sfmc.asset.putAsset(sfmcAPIObject);
                                    debug('Content Builder Update', 'info', assetResponse);
                                }
                                else {
                                    assetResponse = yield sdk.sfmc.asset.postAsset(sfmcAPIObject);
                                    debug('Content Builder Create', 'info', assetResponse);
                                }
                                if (Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey')) {
                                    sfmcAPIObject.customerKey = assetResponse.customerKey;
                                    sfmcAPIObject.id = assetResponse.id;
                                    success.push(sfmcAPIObject);
                                }
                                else {
                                    errors.push(sfmcAPIObject);
                                }
                                break;
                            case 'dataExtension':
                                // createdFolders = await addNewFolders(folderPath);
                                manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
                                manifestContextFolders =
                                    manifestJSON['dataExtension'] && manifestJSON['dataExtension']['folders'];
                                sfmcUpdateObject.assetType = {
                                    name: 'dataExtension',
                                };
                                sfmcUpdateObject.category = manifestContextFolders.find((manifestFolder) => manifestFolder.folderPath === folderPath);
                                sfmcAPIObject = JSON.parse(sfmcUpdateObject.fileContent);
                                sfmcAPIObject.categoryId = sfmcUpdateObject.category.id;
                                debug('Data Extension Payload', 'info', sfmcAPIObject);
                                if (method === 'put') {
                                    // assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                                }
                                else {
                                    assetResponse = yield sdk.sfmc.emailStudio.postAsset(sfmcAPIObject);
                                    debug('Data Extension Create', 'info', assetResponse);
                                }
                                if (assetResponse.OverallStatus === 'OK' &&
                                    Object.prototype.hasOwnProperty.call(assetResponse, 'Results') &&
                                    Object.prototype.hasOwnProperty.call(assetResponse.Results[0], 'Object') &&
                                    Object.prototype.hasOwnProperty.call(assetResponse.Results[0]['Object'], 'CustomerKey')) {
                                    sfmcAPIObject.bldrId = bldrId;
                                    sfmcAPIObject.customerKey = assetResponse.Results[0].Object.CustomerKey;
                                    sfmcAPIObject.category = {
                                        id: sfmcUpdateObject.category.id,
                                        folderPath: sfmcUpdateObject.category.folderPath,
                                    };
                                    yield (0, fileSystem_1.createFile)(`${folderPath}/${sfmcAPIObject.name}.json`, sfmcAPIObject);
                                    success.push(sfmcAPIObject);
                                }
                                else {
                                    errors.push(sfmcAPIObject);
                                }
                                break;
                            case 'sharedDataExtension':
                                // createdFolders = await addNewFolders(folderPath);
                                manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
                                manifestContextFolders =
                                    manifestJSON['sharedDataExtension'] && manifestJSON['sharedDataExtension']['folders'];
                                sfmcUpdateObject.assetType = {
                                    name: 'sharedDataExtension',
                                };
                                sfmcUpdateObject.category = manifestContextFolders.find((manifestFolder) => manifestFolder.folderPath === folderPath);
                                sfmcAPIObject = JSON.parse(sfmcUpdateObject.fileContent);
                                sfmcAPIObject.categoryId = sfmcUpdateObject.category.id;
                                debug('Shared Data Extension Payload', 'info', sfmcAPIObject);
                                if (method === 'put') {
                                    // assetResponse = await sdk.sfmc.asset.putAsset(sfmcAPIObject);
                                }
                                else {
                                    assetResponse = yield sdk.sfmc.emailStudio.postAsset(sfmcAPIObject);
                                    debug('Shared Data Extension Update', 'info', assetResponse);
                                }
                                if (assetResponse.OverallStatus === 'OK' &&
                                    Object.prototype.hasOwnProperty.call(assetResponse, 'Results') &&
                                    Object.prototype.hasOwnProperty.call(assetResponse.Results[0], 'Object') &&
                                    Object.prototype.hasOwnProperty.call(assetResponse.Results[0]['Object'], 'CustomerKey')) {
                                    sfmcAPIObject.bldrId = bldrId;
                                    sfmcAPIObject.customerKey = assetResponse.Results[0].Object.CustomerKey;
                                    sfmcAPIObject.category = {
                                        id: sfmcUpdateObject.category.id,
                                        folderPath: sfmcUpdateObject.category.folderPath,
                                    };
                                    yield (0, fileSystem_1.createFile)(`${folderPath}/${sfmcAPIObject.name}.json`, sfmcAPIObject);
                                    success.push(sfmcAPIObject);
                                }
                                else {
                                    errors.push(sfmcAPIObject);
                                }
                                break;
                        }
                        if (assetResponse.OverallStatus === 'OK' ||
                            Object.prototype.hasOwnProperty.call(assetResponse, 'objectId') ||
                            Object.prototype.hasOwnProperty.call(assetResponse, 'customerKey') ||
                            Object.prototype.hasOwnProperty.call(assetResponse, 'CustomerKey') ||
                            Object.prototype.hasOwnProperty.call(assetResponse, 'key')) {
                            yield removeFromStashByBldrId(bldrId);
                        }
                    }
                }
                return {
                    success,
                    errors,
                };
            }
            catch (err) {
                debug('Create/Update Error', 'error', err);
                console.log(err);
                if (err.JSON && err.JSON.Results && err.JSON.Results[0] && err.JSON.Results[0].StatusMessage) {
                    (0, display_1.displayLine)(err.JSON.Results[0].StatusMessage, 'error');
                }
                err.errorMessage && (0, display_1.displayLine)(err.errorMessage, 'error');
                err.response.data && err.response.data.message && (0, display_1.displayLine)(err.response.data.message, 'error');
                err.response.data &&
                    err.response.data.errors &&
                    Array.isArray(err.response.data.errors) &&
                    err.response.data.errors.forEach((error) => console.log(error));
                err.response.data &&
                    err.response.data.validationErrors &&
                    err.response.data.validationErrors.length &&
                    (0, display_1.displayLine)(err.response.data.validationErrors[0].message, 'error');
                err.response.data &&
                    err.response.data.validationErrors &&
                    err.response.data.validationErrors.length &&
                    (0, display_1.displayLine)(`ErrorCode: ${err.response.data.validationErrors[0].errorcode}`, 'error');
            }
        });
    }
}
exports.Push = Push;
