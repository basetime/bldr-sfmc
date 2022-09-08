import { SFMC_Data_Extension_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_data_extension_assets';
import { Argv } from '../../../_types/Argv';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { displayLine, displayObject } from '../../../_utils/display';
import { guid, uniqueArrayByKey } from '../../../_bldr/_utils';
import flatten from 'flat';
import { createEmailStudioEditableFiles } from '../../../_utils/bldrFileSystem/_context/dataExtension/CreateLocalFiles';
import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const DataExtensionSwitch = async (req: any, argv: Argv) => {
    try {
        const bldr = await initiateBldrSDK();
        //@ts-ignore //TODO figure out why contentBuilder is throwing TS error
        const { emailStudio } = bldr.cli;

        if (!bldr) {
            throw new Error('unable to load sdk');
        }

        switch (req) {
            case 'search':
                /**
                 * Search for Content Builder Folders
                 */
                if (argv.f) {
                    const searchRequest = await emailStudio.searchFolders({
                        contentType: 'dataextension',
                        searchKey: 'Name',
                        searchTerm: argv.f,
                    });

                    displayLine(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest.forEach((obj: any) => {
                        displayObject(flatten(obj));
                    });
                }

                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const searchRequest = await emailStudio.searchDataExtensions({
                        searchKey: 'Name',
                        searchTerm: argv.a,
                    });

                    displayLine(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest.forEach((obj: any) => {
                        displayObject(flatten(obj));
                    });
                }
                break;

            case 'clone':
                displayLine(`Starting Clone`, 'info');
                /**
                 * Clone Content Builder Folders
                 */
                if (argv.f) {
                    const cloneRequest: {
                        assets: SFMC_Data_Extension_Asset[],
                        folders: {
                            ID: number,
                            Name: string;
                            ContentType: string;
                            ParentFolder: any,
                            FolderPath: string;
                        }[]
                    } = await emailStudio.gatherAssetsByCategoryId({
                        contentType: 'dataextension',
                        categoryId: argv.f,
                    });

                    const { assets, folders } = cloneRequest
                    const isolatedFoldersUnique = folders && uniqueArrayByKey(folders, 'id');
                    assets && assets.length && (await createEmailStudioEditableFiles(assets));
                    assets && folders && await updateManifest('dataExtension', {
                        assets: assets,
                        folders: isolatedFoldersUnique,
                    });
                }

                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const cloneRequest: {
                        assets: SFMC_Data_Extension_Asset[],
                        folders: {
                            ID: number,
                            Name: string;
                            ContentType: string;
                            ParentFolder: any,
                            FolderPath: string;
                        }[]
                    } = await emailStudio.gatherAssetById(argv.a);

                     const { assets, folders } = cloneRequest

                    const isolatedFoldersUnique = folders && uniqueArrayByKey(folders, 'id');
                    assets && assets.length && (await createEmailStudioEditableFiles(assets));
                    assets && folders && await updateManifest('dataExtension', {
                        assets: assets,
                        folders: isolatedFoldersUnique,
                    });
                }
                break;
        }

        return;
    } catch (err) {
        console.log(err);
    }
};

export { DataExtensionSwitch };
