import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';
import { MappingByActivityType } from '../../../_utils/bldrFileSystem/_context/automationStudio/automationActivities';
import { Argv } from '../../../_types/Argv';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { displayLine, displayObject } from '../../../_utils/display';
import { uniqueArrayByKey } from '../../../_bldr/_utils';
import flatten from 'flat';
import { SFMC_Automation } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_assets/sfmc_automation';
import { createAutomationStudioEditableFiles } from '../../../_utils/bldrFileSystem/_context/automationStudio/CreateLocalFiles';
import { createContentBuilderEditableFiles } from '../../../_utils/bldrFileSystem/_context/contentBuilder/CreateLocalFiles';

import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
import { findPassword } from 'keytar-sync';
import { update } from 'lodash';
import { State } from '../../../_bldr/_processes/state';
import { incrementMetric } from '../../../_utils/metrics';
const { allowTracking } = new State();

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
        const { automationStudio } = bldr.cli;

        if (!bldr) {
            throw new Error('unable to load sdk');
        }

        switch (req) {
            case 'search':
                /**
                 * Search for Content Builder Folders
                 */
                if (typeof argv.f === 'string' && argv.f.includes(':')) {
                    const activity = argv.f.split(':')[1];
                    const searchTerm = argv._ && argv._[1];

                    let contentType: string = '';
                    switch (activity) {
                        case 'ssjs':
                            contentType = 'ssjsactivity';
                            break;
                        case 'sql':
                            contentType = 'queryactivity';
                            break;
                        case 'esd':
                            contentType = 'userinitiatedsends';
                            break;
                    }

                    const searchRequest = await automationStudio.searchFolders({
                        contentType,
                        searchKey: 'Name',
                        searchTerm: searchTerm,
                    });

                    displayLine(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((obj: any) => {
                            displayObject(flatten(obj));
                        });

                    allowTracking() && incrementMetric(`req_searches_automationStudio_${contentType}_folders`);
                } else if (typeof argv.f === 'string' && !argv.f.includes(':')) {
                    const searchRequest = await automationStudio.searchFolders({
                        contentType: 'automations',
                        searchKey: 'Name',
                        searchTerm: argv.f,
                    });

                    displayLine(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((obj: any) => {
                            displayObject(flatten(obj));
                        });

                    allowTracking() && incrementMetric(`req_searches_automationStudio_automations_folders`);
                }
                /**
                 * Search for AutomationStudio Assets
                 */
                if (typeof argv.a === 'string' && argv.a.includes(':')) {
                    const activity = argv.a.split(':')[1];
                    const searchTerm = argv._ && argv._[1];
                    const searchRequest = await automationStudio.searchActivity(activity, searchTerm);

                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach(
                            (
                                item: {
                                    Name: string;
                                    queryDefinitionId: string;
                                    CategoryID: number;
                                    ModifiedDate: string;
                                }[]
                            ) => displayObject(item)
                        );
                } else if (typeof argv.a === 'string' && !argv.a.includes(':')) {
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
                 * Search for Automation Studio Folders
                 */
                if (typeof argv.f === 'string' && argv.f.includes(':')) {
                    const activity = argv.f.split(':')[1];
                    const categoryId = argv._ && argv._[1];

                    let contentType: string = '';
                    switch (activity) {
                        case 'ssjs':
                            contentType = 'ssjsactivity';
                            break;
                        case 'sql':
                            contentType = 'queryactivity';
                            break;
                        case 'esd':
                            contentType = 'userinitiatedsends';
                            break;
                    }

                    const searchRequest = await automationStudio.gatherAutomationDefinitionsByCategoryId({
                        contentType,
                        categoryId,
                    });

                    if (!searchRequest || !searchRequest.assets || !searchRequest.folders) {
                        displayLine(`Unable to Clone Request`, 'error');
                        return;
                    }

                    const { assets, folders } = searchRequest;

                    const formattedAssetResponse =
                        (await assets) &&
                        Array.isArray(assets) &&
                        assets.map((asset: any) => {
                            const category = folders.find((folder: { ID: number }) => folder.ID === asset.categoryId);
                            asset.assetType = MappingByActivityType(contentType);
                            asset.category = {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };

                            return asset;
                        });

                    const formattedAssetCategories =
                        folders &&
                        Array.isArray(folders) &&
                        folders.map((category: any) => {
                            return {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };
                        });

                    await createAutomationStudioEditableFiles(formattedAssetResponse);
                    await updateManifest('automationStudio', {
                        assets: formattedAssetResponse,
                        folders: formattedAssetCategories,
                    });

                    allowTracking() && incrementMetric(`req_clones_automationStudio_${contentType}_folders`);
                } else if (typeof argv.f === 'number') {
                    const cloneAutomationRequest: {
                        folders: {
                            id: string;
                            name: string;
                            parentId: number;
                            folderPath: string;
                        }[];
                        assets: SFMC_Automation[];
                        formattedAutomationDefinitions: any[];
                        formattedAutomationDependencies: any[];
                    } = await automationStudio.gatherAssetsByCategoryId({
                        contentType: 'automations',
                        categoryId: argv.f,
                    });

                    if (cloneAutomationRequest.assets.length === 0) {
                        displayLine('No items to clone', 'info');
                        return;
                    }

                    await processAutomationCloneRequest(cloneAutomationRequest);
                }

                /**
                 * Search for Automation Studio Assets
                 */
                if (typeof argv.a === 'string' && argv.a.includes(':')) {
                    const activity = argv.a.split(':')[1];
                    const assetId = argv._ && argv._[1];

                    let contentType: string = '';
                    switch (activity) {
                        case 'ssjs':
                            contentType = 'ssjsactivity';
                            break;
                        case 'sql':
                            contentType = 'queryactivity';
                            break;
                        case 'esd':
                            contentType = 'userinitiatedsends';
                            break;
                    }

                    const searchRequest = await automationStudio.gatherAutomationDefinitionsById({
                        contentType,
                        assetId,
                    });

                    if (!searchRequest || !searchRequest.assets || !searchRequest.folders) {
                        displayLine(`Unable to Clone Request`, 'error');
                        return;
                    }

                    const { assets, folders } = searchRequest;

                    const formattedAssetResponse =
                        (await assets) &&
                        Array.isArray(assets) &&
                        assets.map((asset: any) => {
                            const category = folders.find((folder: { ID: number }) => folder.ID === asset.categoryId);
                            asset.assetType = MappingByActivityType(contentType);
                            asset.category = {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };

                            return asset;
                        });

                    const formattedAssetCategories =
                        folders &&
                        Array.isArray(folders) &&
                        folders.map((category: any) => {
                            return {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: category.FolderPath,
                            };
                        });

                    await createAutomationStudioEditableFiles(formattedAssetResponse);
                    await updateManifest('automationStudio', {
                        assets: formattedAssetResponse,
                        folders: formattedAssetCategories,
                    });
                } else if (typeof argv.a === 'string' && !argv.a.includes(':')) {
                    const cloneAutomationRequest: {
                        folders: {
                            id: string;
                            name: string;
                            parentId: number;
                            folderPath: string;
                        }[];
                        assets: SFMC_Automation[];
                        formattedAutomationDefinitions: any[];
                        formattedAutomationDependencies: any[];
                    } = await automationStudio.gatherAssetById(argv.a);

                    if (cloneAutomationRequest.assets.length === 0) {
                        displayLine('No items to clone', 'info');
                        return;
                    }

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
    folders: {
        id: string;
        name: string;
        parentId: number;
        folderPath: string;
    }[];
    assets: SFMC_Automation[];
    formattedAutomationDefinitions: any[];
    formattedAutomationDependencies: any[];
}) => {
    // Create Automation Assets
    cloneAutomationRequest &&
        cloneAutomationRequest.assets &&
        cloneAutomationRequest.assets.length &&
        (await createAutomationStudioEditableFiles(cloneAutomationRequest.assets));

    // Create Automation Definitions
    cloneAutomationRequest &&
        cloneAutomationRequest.formattedAutomationDefinitions &&
        cloneAutomationRequest.formattedAutomationDefinitions.length &&
        (await createAutomationStudioEditableFiles(cloneAutomationRequest.formattedAutomationDefinitions));

    await updateManifest('automationStudio', {
        assets: cloneAutomationRequest.assets,
    });

    await updateManifest('automationStudio', {
        assets: cloneAutomationRequest.formattedAutomationDefinitions,
    });

    displayLine(`>> Cloned ${cloneAutomationRequest.assets.length} Automations`);
    displayLine(`>> Cloned ${cloneAutomationRequest.formattedAutomationDefinitions.length} Definitions`);

    // Create Automation Dependencies
    Object.keys(cloneAutomationRequest.formattedAutomationDependencies) &&
        Object.keys(cloneAutomationRequest.formattedAutomationDependencies).forEach(async (context: any) => {
            displayLine(`Cloning Dependencies: ${context}`, 'info');

            const contextDependencies = cloneAutomationRequest.formattedAutomationDependencies[context];
            contextDependencies &&
                contextDependencies.assets &&
                contextDependencies.assets.length &&
                (await createContentBuilderEditableFiles(contextDependencies.assets));

            contextDependencies &&
                contextDependencies.assets &&
                contextDependencies.assets.length &&
                (await updateManifest(context, contextDependencies));
            displayLine(`>> Cloned ${contextDependencies.assets.length} ${context} Dependencies`);
        });
};

export { AutomationStudioSwitch };
