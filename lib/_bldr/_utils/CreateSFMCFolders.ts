
import { initiateBldrSDK } from "../../_bldr_sdk";
import { getFilePathDetails, uniqueArrayByKey } from ".";
import { displayLine } from "../../_utils/display";
import { readManifest } from "../../_utils/bldrFileSystem";
import { updateManifest } from "../../_utils/bldrFileSystem/manifestJSON";
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

        createdFolderCount > 0 && displayLine(`>> ${createdFolderCount} folders created`);
        return createdFoldersOutput;
    } catch (err: any) {
        console.log(err);
        console.log(err.message);
    }
};

export {
    addNewFolders
}
