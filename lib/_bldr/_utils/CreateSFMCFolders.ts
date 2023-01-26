import { initiateBldrSDK } from '../../_bldr_sdk';
import { getFilePathDetails, uniqueArrayByKey } from '.';
import { displayLine } from '../../_utils/display';
import { readManifest } from '../../_utils/bldrFileSystem';
import { updateManifest } from '../../_utils/bldrFileSystem/manifestJSON';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
/**
 * Method to create new folders in SFMC when the do not exist
 *
 * @param {object} categoryDetails various folder/asset values from the full file path
 * @param {string} dirPath project root folder
 */
const addNewFolders = async (stashItemFolderPath: string) => {
    try {
        let createdFolderCount = 0;
        const sdk = await initiateBldrSDK();
        const { context } = await getFilePathDetails(stashItemFolderPath);
        // Split path into array to check each individually
        const stashItemFolderArray = stashItemFolderPath.split('/');
        // Grab root folder from path
        const rootContextFolder = stashItemFolderArray.shift();

        // Get .local.manifest.json file
        let manifestJSON = await readManifest();
        const manifestAssetCategories = manifestJSON[context.context]['assets'].map(
            (manifestAsset: { category: { folderPath: string } }) => manifestAsset && manifestAsset.category
        );
        let manifestFolderCategories = manifestJSON[context.context]['folders'].map(
            (manifestFolder: { folderPath: string }) => manifestFolder
        );
        let manifestFolders = await uniqueArrayByKey(
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

            manifestJSON = await readManifest();
            manifestFolderCategories = manifestJSON[context.context]['folders'].map(
                       (manifestFolder: { folderPath: string }) => manifestFolder
                   );
            manifestFolders = await uniqueArrayByKey(
                       [...manifestAssetCategories, ...manifestFolderCategories],
                       'folderPath'
                   );

            // Check if folder path exists in .local.manifest.json
            const folderIndex = manifestFolders.findIndex(
                (manifestFolder: { folderPath: string }) => checkPath && manifestFolder.folderPath.includes(checkPath)
            );

            // If folder does not exist
            if (folderIndex === -1) {
                if (typeof parentId === 'undefined') {
                    console.log('parent request', {
                        contentType: context.contentType,
                        searchKey: 'Name',
                        searchTerm: context.name,
                    })

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

                    const parentFolderObject = {
                        id: parentFolderResponse.Results[0].ID,
                        name: rootContextFolder,
                        parentId: parentFolderResponse.Results[0].ParentFolder.ID,
                        folderPath: rootContextFolder,
                    };

                    await updateManifest(context.context, { folders: [parentFolderObject] });

                    parentId = parentFolderResponse.Results[0].ID;
                }


                // Create folder via SFMC API
                createFolder = await sdk.sfmc.folder.createFolder({
                    contentType: context.contentType,
                    name: folder,
                    parentId,
                });

                if (!createFolder || typeof createFolder === 'string' && createFolder.includes('Please select a different Name.')) {
                    const existingFolder: any = await addExistingFolderToManifest(sdk, {
                        context,
                        folder,
                        checkPath,
                        parentId,
                    });

                    parentId = existingFolder && existingFolder.id;
                } else if (createFolder.StatusCode === 'Error') {
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

        createdFolderCount > 0 && displayLine(`>> ${createdFolderCount} folders created`);
        return createdFoldersOutput;
    } catch (err: any) {
        console.log(err);
        console.log(err.message);
    }
};

/**
 *
 * @param sdk
 * @param request
 * @returns
 */
const addExistingFolderToManifest = async (
    sdk: BLDR_Client,
    request: {
        context: {
            contentType: string;
            context: string;
        };
        folder: string;
        checkPath: string;
        parentId: number;
    }
) => {
    const existingFolder = await sdk.sfmc.folder.search({
        contentType: request.context.contentType,
        searchKey: 'Name',
        searchTerm: request.folder,
        parentId: request.parentId,
    });

    if (
        existingFolder.OverallStatus === 'OK' &&
        Object.prototype.hasOwnProperty.call(existingFolder, 'Results') &&
        existingFolder.Results.length
    ) {
        const results = existingFolder.Results;
        const folderObject = results.find((folderResult: { Name: string }) => folderResult.Name === request.folder);

        const folderOutput = {
            id: folderObject.ID,
            name: request.folder,
            parentId: folderObject.ParentFolder.ID,
            folderPath: request.checkPath,
        };

        folderObject &&
            (await updateManifest(request.context.context, {
                folders: [folderOutput],
            }));

        return folderOutput;
    }
};

export { addNewFolders };
