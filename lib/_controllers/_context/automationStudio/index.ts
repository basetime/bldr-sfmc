import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';
import { Argv } from '../../../_types/Argv';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { displayLine, displayObject } from '../../../_utils/display';
import { uniqueArrayByKey } from '../../../_bldr/_utils';
import flatten from 'flat';
import {SFMC_Automation} from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_assets/sfmc_automation';
import { createAutomationStudioEditableFiles } from '../../../_utils/bldrFileSystem/_context/automationStudio/CreateLocalFiles';

import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const AutomationStudioSwitch = async (req: any, argv: Argv) => {
    try {
        const bldr = await initiateBldrSDK();
        //@ts-ignore //TODO figure out why contentBuilder is throwing TS error
        const { automationStudio } = bldr.cli;

        if (!bldr) {
            throw new Error('unable to load sdk');
        }

        switch (req) {
            case 'search':
                /**
                 * Search for Content Builder Folders
                 */
                if (argv.f) {
                    const searchRequest = await automationStudio.searchFolders({
                        contentType: 'automations',
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
                    const searchRequest = await automationStudio.searchAssets({
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
                /**
                 * Search for Content Builder Folders
                 */
                // if (argv.f) {
                //     const cloneRequest: SFMC_Content_Builder_Asset[] = await contentBuilder.gatherAssetsByCategoryId({
                //         contentType: 'asset',
                //         categoryId: argv.f,
                //     });
                //     const isolatedFolders = cloneRequest.map((cloneItem) => cloneItem && cloneItem.category);
                //     const isolatedFoldersUnique = await uniqueArrayByKey(isolatedFolders, 'id');

                //     cloneRequest && cloneRequest.length && (await createEditableFiles(cloneRequest));

                //     await updateManifest('contentBuilder', {
                //         assets: cloneRequest,
                //         folders: isolatedFoldersUnique,
                //     });
                // }

                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const cloneAutomationRequest: {
                        formattedAssetResponse: SFMC_Automation[],
                        formattedAutomationDefinitions: any[]
                    } = await automationStudio.gatherAssetById(argv.a);

                    cloneAutomationRequest && cloneAutomationRequest.formattedAssetResponse && cloneAutomationRequest.formattedAssetResponse.length && (await createAutomationStudioEditableFiles(cloneAutomationRequest.formattedAssetResponse));

                    cloneAutomationRequest && cloneAutomationRequest.formattedAutomationDefinitions && cloneAutomationRequest.formattedAutomationDefinitions.length && (await createAutomationStudioEditableFiles(cloneAutomationRequest.formattedAutomationDefinitions));

                    await updateManifest('automationStudio', {
                        assets: cloneAutomationRequest.formattedAssetResponse
                    });

                    await updateManifest('automationStudio', {
                        assets: cloneAutomationRequest.formattedAutomationDefinitions
                    });
                }
                break;
        }

        return;
    } catch (err: any) {
        console.log(err);
    }
};

export { AutomationStudioSwitch };
