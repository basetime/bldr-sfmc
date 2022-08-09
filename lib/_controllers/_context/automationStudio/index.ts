import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';
import { Argv } from '../../../_types/Argv';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { displayLine, displayObject } from '../../../_utils/display';
import { uniqueArrayByKey } from '../../../_bldr/_utils';
import flatten from 'flat';
import { SFMC_Automation } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_assets/sfmc_automation';
import { createAutomationStudioEditableFiles } from '../../../_utils/bldrFileSystem/_context/automationStudio/CreateLocalFiles';
import { createContentBuilderEditableFiles } from '../../../_utils/bldrFileSystem/_context/contentBuilder/CreateLocalFiles';

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
                displayLine(`Starting Clone`, 'info');
                /**
                 * Search for Content Builder Folders
                 */
                if (argv.f) {
                    const cloneAutomationRequest: {
                        formattedAssetResponse: any[];
                        formattedAutomationDefinitions: any[];
                        formattedAutomationDependencies: any[];
                    } = await automationStudio.gatherAssetsByCategoryId({
                        contentType: 'automations',
                        categoryId: argv.f,
                    });

                    await processAutomationCloneRequest(cloneAutomationRequest);
                }

                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const cloneAutomationRequest: {
                        formattedAssetResponse: SFMC_Automation[];
                        formattedAutomationDefinitions: any[];
                        formattedAutomationDependencies: any[];
                    } = await automationStudio.gatherAssetById(argv.a);

                    await processAutomationCloneRequest(cloneAutomationRequest);
                }
                break;
        }

        return;
    } catch (err: any) {
        console.log(err);
    }
};

const processAutomationCloneRequest = async (cloneAutomationRequest: {
    formattedAssetResponse: SFMC_Automation[];
    formattedAutomationDefinitions: any[];
    formattedAutomationDependencies: any[];
}) => {
    // Create Automation Assets
    cloneAutomationRequest &&
        cloneAutomationRequest.formattedAssetResponse &&
        cloneAutomationRequest.formattedAssetResponse.length &&
        (await createAutomationStudioEditableFiles(cloneAutomationRequest.formattedAssetResponse));

    // Create Automation Definitions
    cloneAutomationRequest &&
        cloneAutomationRequest.formattedAutomationDefinitions &&
        cloneAutomationRequest.formattedAutomationDefinitions.length &&
        (await createAutomationStudioEditableFiles(cloneAutomationRequest.formattedAutomationDefinitions));

    await updateManifest('automationStudio', {
        assets: cloneAutomationRequest.formattedAssetResponse,
    });

    await updateManifest('automationStudio', {
        assets: cloneAutomationRequest.formattedAutomationDefinitions,
    });

    displayLine(`>> Cloned ${cloneAutomationRequest.formattedAssetResponse.length} Automations`);
    displayLine(`>> Cloned ${cloneAutomationRequest.formattedAutomationDefinitions.length} Definitions`);

    // Create Automation Dependencies
    Object.keys(cloneAutomationRequest.formattedAutomationDependencies) &&
        Object.keys(cloneAutomationRequest.formattedAutomationDependencies).forEach(async (context: any) => {
            displayLine(`Cloning Dependencies: ${context}`, 'info');
            const contextDependencies = cloneAutomationRequest.formattedAutomationDependencies[context];
            let manifestUpdates: {
                folders?: any[];
                assets: any[];
            } = {
                assets: contextDependencies,
            };

            switch (context) {
                case 'contentBuilder':
                    manifestUpdates.folders = contextDependencies.map((dep: any) => dep.category);
                    await createContentBuilderEditableFiles(contextDependencies);
                    break;
            }

            await updateManifest(context, manifestUpdates);
            displayLine(`>> Cloned ${contextDependencies.length} ${context} Dependencies`);
        });
};

export { AutomationStudioSwitch };
