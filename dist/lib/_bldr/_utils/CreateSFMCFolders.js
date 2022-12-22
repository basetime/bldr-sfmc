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
exports.addNewFolders = void 0;
const _bldr_sdk_1 = require("../../_bldr_sdk");
const _1 = require(".");
const display_1 = require("../../_utils/display");
const bldrFileSystem_1 = require("../../_utils/bldrFileSystem");
const manifestJSON_1 = require("../../_utils/bldrFileSystem/manifestJSON");
/**
 * Method to create new folders in SFMC when the do not exist
 *
 * @param {object} categoryDetails various folder/asset values from the full file path
 * @param {string} dirPath project root folder
 */
const addNewFolders = (stashItemFolderPath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let createdFolderCount = 0;
        const sdk = yield (0, _bldr_sdk_1.initiateBldrSDK)();
        const { context } = yield (0, _1.getFilePathDetails)(stashItemFolderPath);
        // Split path into array to check each individually
        const stashItemFolderArray = stashItemFolderPath.split('/');
        // Grab root folder from path
        const rootContextFolder = stashItemFolderArray.shift();
        // Get .local.manifest.json file
        let manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
        const manifestAssetCategories = manifestJSON[context.context]['assets'].map((manifestAsset) => manifestAsset && manifestAsset.category);
        let manifestFolderCategories = manifestJSON[context.context]['folders'].map((manifestFolder) => manifestFolder);
        let manifestFolders = yield (0, _1.uniqueArrayByKey)([...manifestAssetCategories, ...manifestFolderCategories], 'folderPath');
        const createdFoldersOutput = [];
        let checkPath = rootContextFolder;
        let parentId;
        let createFolder;
        // Iterate through all folder names to see where folders need to be created
        for (const stashItemFolder in stashItemFolderArray) {
            const folder = stashItemFolderArray[stashItemFolder];
            let updatedFolder = 0;
            // Compile path to check against
            checkPath = `${checkPath}/${folder}`;
            manifestJSON = yield (0, bldrFileSystem_1.readManifest)();
            manifestFolderCategories = manifestJSON[context.context]['folders'].map((manifestFolder) => manifestFolder);
            manifestFolders = yield (0, _1.uniqueArrayByKey)([...manifestAssetCategories, ...manifestFolderCategories], 'folderPath');
            // Check if folder path exists in .local.manifest.json
            const folderIndex = manifestFolders.findIndex((manifestFolder) => checkPath && manifestFolder.folderPath.includes(checkPath));
            // If folder does not exist
            if (folderIndex === -1) {
                if (typeof parentId === 'undefined') {
                    const parentFolderResponse = yield sdk.sfmc.folder.search({
                        contentType: context.contentType,
                        searchKey: 'Name',
                        searchTerm: context.name,
                    });
                    if (parentFolderResponse.OverallStatus !== 'OK') {
                        throw new Error(parentFolderResponse.OverallStatus);
                    }
                    if (!Object.prototype.hasOwnProperty.call(parentFolderResponse, 'Results') &&
                        parentFolderResponse.Results.length > 0) {
                        throw new Error('No Results Found for Root Folder');
                    }
                    const parentFolderObject = {
                        id: parentFolderResponse.Results[0].ID,
                        name: rootContextFolder,
                        parentId: parentFolderResponse.Results[0].ParentFolder.ID,
                        folderPath: rootContextFolder,
                    };
                    yield (0, manifestJSON_1.updateManifest)(context.context, { folders: [parentFolderObject] });
                    parentId = parentFolderResponse.Results[0].ID;
                }
                // Create folder via SFMC API
                createFolder = yield sdk.sfmc.folder.createFolder({
                    contentType: context.contentType,
                    name: folder,
                    parentId,
                });
                if (!createFolder || typeof createFolder === 'string' && createFolder.includes('Please select a different Name.')) {
                    const existingFolder = yield addExistingFolderToManifest(sdk, {
                        context,
                        folder,
                        checkPath,
                        parentId,
                    });
                    parentId = existingFolder && existingFolder.id;
                }
                else if (createFolder.StatusCode === 'Error') {
                    throw new Error(createFolder.StatusMessage);
                }
                else {
                    // Wait for response from folder creation and add object to manifestFolder array
                    // Folder permissions my not allow child folders, so when exception is thrown create will retry
                    // do/while will check until retry is done and folder is created
                    do {
                        const newFolderId = (createFolder && createFolder.Results && createFolder.Results[0].NewID) || null;
                        if (newFolderId) {
                            (0, display_1.displayLine)(`${folder} has been created; CategoryId: ${newFolderId}`, 'success');
                            const createdFolderObject = {
                                id: newFolderId,
                                name: folder,
                                parentId,
                                folderPath: checkPath,
                            };
                            yield (0, manifestJSON_1.updateManifest)(context.context, { folders: [createdFolderObject] });
                            parentId = createFolder && createFolder.Results && createFolder.Results[0].NewID;
                            createdFoldersOutput.push(createdFolderObject);
                            createdFolderCount++;
                        }
                        updatedFolder++;
                    } while (typeof createFolder !== 'undefined' && updatedFolder === 0);
                }
            }
            else {
                parentId = manifestFolders[folderIndex].id;
            }
        }
        createdFolderCount > 0 && (0, display_1.displayLine)(`>> ${createdFolderCount} folders created`);
        return createdFoldersOutput;
    }
    catch (err) {
        console.log(err);
        console.log(err.message);
    }
});
exports.addNewFolders = addNewFolders;
/**
 *
 * @param sdk
 * @param request
 * @returns
 */
const addExistingFolderToManifest = (sdk, request) => __awaiter(void 0, void 0, void 0, function* () {
    const existingFolder = yield sdk.sfmc.folder.search({
        contentType: request.context.contentType,
        searchKey: 'Name',
        searchTerm: request.folder,
        parentId: request.parentId,
    });
    if (existingFolder.OverallStatus === 'OK' &&
        Object.prototype.hasOwnProperty.call(existingFolder, 'Results') &&
        existingFolder.Results.length) {
        const results = existingFolder.Results;
        const folderObject = results.find((folderResult) => folderResult.Name === request.folder);
        const folderOutput = {
            id: folderObject.ID,
            name: request.folder,
            parentId: folderObject.ParentFolder.ID,
            folderPath: request.checkPath,
        };
        folderObject &&
            (yield (0, manifestJSON_1.updateManifest)(request.context.context, {
                folders: [folderOutput],
            }));
        return folderOutput;
    }
});
