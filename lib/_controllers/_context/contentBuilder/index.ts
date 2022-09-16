import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';
import { Argv } from '../../../_types/Argv';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { displayLine, displayObject } from '../../../_utils/display';
import { uniqueArrayByKey } from '../../../_bldr/_utils';
import flatten from 'flat';
import { createContentBuilderEditableFiles } from '../../../_utils/bldrFileSystem/_context/contentBuilder/CreateLocalFiles';
import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
import yargsInteractive from 'yargs-interactive';
const delete_confirm = require('../../../_utils/options/delete_confirm')

/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const ContentBuilderSwitch = async (req: any, argv: Argv) => {
    try {
        const bldr = await initiateBldrSDK();
        //@ts-ignore //TODO figure out why contentBuilder is throwing TS error
        const { contentBuilder } = bldr.cli;

        if (!bldr) {
            throw new Error('unable to load sdk');
        }

        switch (req) {
            case 'search':
                /**
                 * Search for Content Builder Folders
                 */
                if (argv.f) {
                    const searchRequest = await contentBuilder.searchFolders({
                        contentType: 'asset',
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
                    const searchRequest = await contentBuilder.searchAssets({
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
                        assets: SFMC_Content_Builder_Asset[];
                        folders: {
                            ID: number;
                            Name: string;
                            ContentType: string;
                            ParentFolder: any;
                            FolderPath: string;
                        }[];
                    } = await contentBuilder.gatherAssetsByCategoryId({
                        contentType: 'asset',
                        categoryId: argv.f,
                    });

                    const { assets, folders } = cloneRequest;

                    const isolatedFoldersUnique = folders && uniqueArrayByKey(folders, 'id');
                    assets && assets.length && (await createContentBuilderEditableFiles(assets));
                    assets &&
                        folders &&
                        (await updateManifest('contentBuilder', {
                            assets: assets,
                            folders: isolatedFoldersUnique,
                        }));
                }

                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const cloneRequest: {
                        assets: SFMC_Content_Builder_Asset[];
                        folders: {
                            ID: number;
                            Name: string;
                            ContentType: string;
                            ParentFolder: any;
                            FolderPath: string;
                        }[];
                    } = await contentBuilder.gatherAssetById(argv.a);

                    const { assets, folders } = cloneRequest;

                    const isolatedFoldersUnique = folders && uniqueArrayByKey(folders, 'id');
                    assets && assets.length && (await createContentBuilderEditableFiles(assets));
                    assets &&
                        folders &&
                        (await updateManifest('contentBuilder', {
                            assets: assets,
                            folders: isolatedFoldersUnique,
                        }));
                }
                break;

            case 'delete':
                if (argv.f) { }

                if (argv.a) {
                    yargsInteractive()
                        .usage('$bldr init [args]')
                        .interactive(delete_confirm)
                        .then(async (initResults) => {



                        })
                }
                break;
        }

        return;
    } catch (err) {
        console.log(err);
    }
};

export { ContentBuilderSwitch };
