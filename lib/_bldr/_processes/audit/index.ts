import { initiateBldrSDK } from '../../../_bldr_sdk';
import { Argv } from '../../../_types/Argv';
import { displayArrayOfStrings, displayLine, displayObject } from '../../../_utils/display';
import { State } from '../state';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { flattenJSONObject, splitArrayIntoChunks, uniqueArrayByKey } from '../../_utils';
import { createDirectory, createFile } from '../../../_utils/fileSystem';
import json2md from 'json2md';
import { json2csv } from 'json-2-csv';
import { json } from 'stream/consumers';
import sfmc_context_map from '@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping';
import pMap from 'p-map';
import { getProperties } from 'sfmc-soap-object-reference';
import { jsonquery } from '@jsonquerylang/jsonquery';
import fs from 'fs';
import path from 'path';
import yargsInteractive from 'yargs-interactive';
import { auditSelection } from '../../../_utils/options/audit_selection';

type IGenericObject = { [key: string]: any };

const { getState, allowTracking, debug } = new State();
const rawResponsesBasePath = './audit/raw_api_responses';

/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
export class Audit {
    constructor() {}
    /**
     * Initiate the setting of a Configuration
     * Prompts user input
     * Tests/Gathers all child business unit Names and MIDs
     * Saves configuration to config file
     * Sets configuration to state management file
     * @param argv
     *
     */
    initiateAudit = async (argv: Argv) => {
        try {
            // const auditOptions = auditSelection() as { [key: string]: any };

            // yargsInteractive()
            //     .usage('$bldr audit [args]')
            //     .interactive(auditOptions)
            //     .then(async (configResults) => {
            //         const sdk = await initiateBldrSDK();
            //         createDirectory(`${rawResponsesBasePath}`);
            //         const selectionMap = [
            //             { name: 'Content Builder', value: 'contentBuilder' },
            //             { name: 'Data Extensions', value: 'dataExtensions' },
            //             { name: 'Automation Studio', value: 'automationStudio' },
            //             { name: 'Journey Builder', value: 'REST_interaction/v1/interactions' },
            //             { name: 'Email Send Definitions', value: 'SOAP_emailSendDefinition' },
            //             { name: 'Extract Definitions', value: 'SOAP_extractDefinition' },
            //             { name: 'File Triggers', value: 'SOAP_fileTrigger' },
            //             { name: 'Filter Definitions', value: 'SOAP_filterDefinition' },
            //             { name: 'Import Definitions', value: 'SOAP_importDefinition' },
            //             { name: 'Query Definitions', value: 'SOAP_queryDefinition' },
            //             { name: 'Triggered Send Definitions', value: 'SOAP_triggeredSendDefinition' },
            //             { name: 'Event Definitions', value: 'REST_interaction/v1/eventDefinitions' },
            //             { name: 'Attribute Set Definitions', value: 'REST_contacts/v1/attributeSetDefinitions' },
            //         ];

            //         const selectedKeys = selectionMap
            //             .map((item) => {
            //                 if (configResults.auditSelection.includes(item.name)) {
            //                     return item.value;
            //                 }

            //                 return null;
            //             })
            //             .filter(Boolean) as string[];

            //         this.auditAutomations(sdk, selectedKeys).then(() => {});
            //     });

            const sdk = await initiateBldrSDK();
            createDirectory(`${rawResponsesBasePath}`);
            const runAudit = async () => {
                // await this.auditDataExtensions(sdk);
                // await this.auditAutomations(sdk);
                // await this.auditBulkSoap(sdk);
                await this.auditBulkRest(sdk);
                // await this.auditContentBuilder(sdk);
            };

            await runAudit().then(async () => {
                // setTimeout(() => this.auditJSON(), 2000);
            });

            // this.auditJSON();
        } catch (err: any) {
            displayLine('error is here', 'error');
            console.log(err);
            err.message && displayLine(err.message, 'error');
            return err;
        }
    };

    private auditJSON = async () => {
        const output: IGenericObject = {
            map: {},
            raw: {},
        };

        function findMatchingRawObjects(data: IGenericObject, anchor: string) {
            // Get all keys under the "raw" object
            let rawKeys: any[] = Object.keys(data.raw);
            let mapKeys: any[] = Object.keys(data.map);

            const bypassFilterKeys = [''];
            // const bypassFilterKeys = ['assets'];
            if (anchor) {
                rawKeys = rawKeys.map((key) => {
                    //If the anchor is
                    if (key === anchor && bypassFilterKeys.includes(key)) {
                        return key.toLocaleLowerCase();
                    }

                    if (key === anchor) {
                        return null;
                    }

                    return key.toLowerCase();
                });

                rawKeys = rawKeys.filter((key) => key !== anchor);
                mapKeys = mapKeys.filter((key) => key === anchor);
            }

            // Result array to store matching objects
            const result: IGenericObject = {
                anchor,
                matches: [],
                unused: [],
            };

            mapKeys.forEach((mapKey) => {
                const mapArray = data.map[mapKey];
                // Check if the value is an array
                if (Array.isArray(mapArray)) {
                    // Iterate through the array
                    mapArray.forEach((mapItem) => {
                        const mapValues = mapItem.ids;
                        // Iterate through each key in the raw object
                        rawKeys.forEach((rawKey) => {
                            const rawArray = data.raw[rawKey];

                            // Check if the value is an array
                            if (Array.isArray(rawArray)) {
                                // Iterate through the array
                                rawArray.forEach((item) => {
                                    const itemString = JSON.stringify(item);
                                    const matchingValues = mapValues
                                        .filter((value: string) => (itemString.includes(value) && value) || null)
                                        .filter(Boolean);

                                    // const unusedValues = mapValues
                                    //     .filter((value: string) => (!itemString.includes(value) && value) || null)
                                    //     .filter(Boolean);

                                    matchingValues &&
                                        matchingValues.length &&
                                        result['matches'].push({
                                            anchorName: mapItem.name,
                                            anchorType: anchor,
                                            matchedName: item.name || item.Name,
                                            matchedType: rawKey,
                                            anchorValues: matchingValues,
                                            // matchedJson: JSON.stringify(item),
                                        });

                                    // unusedValues &&
                                    //     unusedValues.length &&
                                    //     result['unused'].push({ anchorName: mapItem.name, anchorType: anchor });
                                });
                            }
                        });
                    });
                }
            });

            return { ...result, matches: result.matches, unused: uniqueArrayByKey(result.unused, 'name') };
        }

        const requestParams = [
            'data_extensions',
            'EmailSendDefinition',
            'ExtractDefinition',
            // 'FileTrigger',
            'FilterDefinition',
            'ImportDefinition',
            'QueryDefinition',
            'TriggeredSendDefinition',
            'interactions',
            'assets_0',
            'assets_1',
            'assets_2',
            'assets_3',
            'assets_4',
            'assets_5',
            'assets_6',
            'assets_7',
            'assets_8',
            'assets_9',
            'assets_8',
            'assets_10',
            'assets_11',
            'assets_12',
            'assets_13',
            'eventDefinitions',
            'attributeSetDefinitions',
            'automations',
            'automation_definitions',
            'automation_dependencies',
        ];

        for (const r in requestParams) {
            const auditKeys = ['ObjectID', 'CustomerKey', 'ID', 'objectId', 'customerKey', 'id', 'activityObjectId'];
            const param = requestParams[r].toLowerCase();
            const dataRaw = fs.readFileSync(`./audit/raw_api_responses/json/${param}.json`);
            const dataStr = dataRaw && dataRaw.toString();
            const data = dataRaw && JSON.parse(dataStr);

            if (!data) {
                displayLine(`No data found for ${param}`, 'error');
                continue;
            }

            output['map'][param] = data
                .map((item: any) => {
                    if (!item || !Object.keys(item).length) {
                        return null;
                    }

                    const keys = Object.keys(item);
                    const objectAuditKeys = {
                        name: item.name || item.Name,
                        ids:
                            (keys &&
                                keys.length &&
                                keys.map((key) => (auditKeys.includes(key) && item[key]) || null).filter(Boolean)) ||
                            [],
                    };

                    return objectAuditKeys;
                })
                .filter(Boolean);

            output['raw'][param] = data || {};
        }

        await Promise.all(
            requestParams.map(async (param) => {
                const matchingRawObjects = await findMatchingRawObjects(output, param);
                // await this.writeCSV(matchingRawObjects.unused, `/unused/${param}`);
                await this.writeCSV(matchingRawObjects.matches, `/matches-2/${param}`);
                return matchingRawObjects;
            })
        );

        // const auditKeys = ['ObjectID', 'CustomerKey', 'ID', 'objectId', 'customerKey', 'id'];
        // const dataRaw = fs.readFileSync(`./audit/raw_api_responses/json/automation_dependencies.json`);
        // console.log(dataRaw)
        // const data = JSON.parse(dataRaw.toString());
        // return data.map((item: any) => {
        //     const keys = Object.keys(item);
        //     const objectAuditKeys = keys.map((key) => (auditKeys.includes(key) && item[key]) || null).filter(Boolean);
        //     return objectAuditKeys;
        // });
    };

    private writeCSV = async (data: any, fileName: string) => {
        createFile(`${rawResponsesBasePath}/csv/${fileName}.csv`, json2csv(data));
    };

    private writeJSON = async (data: any, fileName: string) => {
        createFile(`${rawResponsesBasePath}/json/${fileName}.json`, data);
    };

    private writeLocalFiles = async (data: any, fileName: string) => {
        this.writeJSON(data, fileName);
        // this.writeCSV(data, fileName);
    };

    private auditBulkRest = async (sdk: BLDR_Client) => {
        const requestParams = [
            'interaction/v1/interactions?extras=activities&status=published',
            // 'asset/v1/content/assets',
            // 'interaction/v1/eventDefinitions',
            // 'contacts/v1/attributeSetDefinitions',
        ];

        for (const r in requestParams) {
            const param = requestParams[r];
            let paramId = param.split('/')[param.split('/').length - 1].toLowerCase();
            paramId = (paramId.includes('?') && paramId.split('?')[0]) || paramId;
            displayLine(`Fetching ${param}...`, 'progress');
            const request = await sdk.sfmc.client.rest.getBulk(param);
            // request.object = param;

            if (request && request.items) {
                // this.writeLocalFiles(request.items, paramId);
            }

            console.log(`Fetched ${request.items.length} items from ${param}`);
            // request.items.map((item: any) => console.log(JSON.stringify(item, null, 2)));

            const journeyInformation = [];

            for (const item of request.items) {
                console.log(`Processing item: ${item.name} (${item.id})`);

                // Flatten the item object
                const activities = item.activities || [];
                const emailActivities = activities.filter((activity: any) => activity.type === 'EMAILV2');

                const emails = await emailActivities.map(async (activity: any) => {
                    const legacyId = activity.configurationArguments.triggeredSend.emailId;

                    const emailRequest = await sdk.sfmc.client.rest.get(
                        `/asset/v1/content/assets?$filter=data.email.legacy.legacyId%20eq%20"${legacyId}"&scope=Ours,Shared`
                    );

                    // this.writeLocalFiles(emailRequest.items[0], `email_${emailRequest.items[0].name}.json`);
                    console.log([item.name, item.version, activity.name, emailRequest.items[0].name].join(','));
                });
            }
        }
    };

    private auditBulkSoap = async (sdk: BLDR_Client) => {
        const requestParams = [
            'EmailSendDefinition',
            'ExtractDefinition',
            'FileTrigger',
            'FilterDefinition',
            'ImportDefinition',
            'QueryDefinition',
            'TriggeredSendDefinition',
        ];
        for (const r in requestParams) {
            const param = requestParams[r];
            let properties = getProperties(param);

            if (param === 'EmailSendDefinition') {
                properties = properties.filter(
                    (p: string) => !p.includes('DeliveryProfile') && !p.includes('SendWindowCloses')
                );
            }

            displayLine(`Fetching ${param}...`, 'progress');
            const request = await sdk.sfmc.client.soap.retrieveBulk(param, properties, {
                filter: {
                    leftOperand: 'Name',
                    operator: 'isNotNull',
                    rightOperand: '',
                },
            });

            request.object = param;

            if (request && request.Results) {
                this.writeLocalFiles(request.Results, param.toLowerCase());
            }
        }
    };

    private auditAutomations = async (sdk: BLDR_Client, auditSelection: string[]) => {
        if (!auditSelection.includes('automationStudio')) {
            return;
        }

        const RootResp = await sdk.sfmc.folder.search({
            contentType: 'automations',
            searchKey: 'Name',
            searchTerm: 'my automations',
        });

        const rootId = RootResp && RootResp.Results && RootResp.Results[0] && RootResp.Results[0].ID;
        const automationFolders = await sdk.sfmc.folder.getSubfoldersRecursive({
            contentType: 'automations',
            categoryId: rootId,
        });

        const folderIds = automationFolders.map((folder: { [key: string]: any }) => ({
            id: folder.ID,
            name: folder.Name,
        }));

        folderIds.push(rootId);

        const chunks = splitArrayIntoChunks(folderIds, 10);

        displayLine('Fetching Automations...', 'progress');
        displayLine(`Total Automation Folders: ${folderIds.length}`, 'info');

        const mapFn = async (folder: { id: number; name: string }) => {
            const subResponse = await sdk.cli.automationStudio.gatherAssetsByCategoryId({
                contentType: 'automations',
                categoryId: folder.id,
            });

            subResponse.assets &&
                subResponse.assets.length &&
                setTimeout(() => {
                    displayLine(
                        `Fetching Automation Response from ${folder.name}: ${subResponse.assets.length}...`,
                        'progress'
                    );
                }, 2000);

            return subResponse;
        };

        const requests = await Promise.all(
            chunks.map(async (chunk, i) => {
                displayLine(`Chunk array ${i}: ${chunk.length}`, 'info');

                const results = [];
                for (const folder of chunk) {
                    results.push(await mapFn(folder));
                }

                return results;
            })
        );

        const requestResponses = requests.flat().flatMap((request: any) => request.assets);
        const requestDefinitionResponses = requests
            .flat()
            .flatMap((request: any) => request.formattedAutomationDefinitions);
        const requestDependenciesResponses = requests
            .flat()
            .flatMap((request: any) => request.formattedAutomationDependencies);

        requestResponses && displayLine(`Total Automations: ${requestResponses.length}`, 'info');
        this.writeLocalFiles(requestResponses, 'automations');
        this.writeLocalFiles(requestDefinitionResponses, 'automation_definitions');
        this.writeLocalFiles(requestDependenciesResponses, 'automation_dependencies');

        createFile(`${rawResponsesBasePath}/automations-raw.json`, requests);
    };

    private auditDataExtensions = async (sdk: BLDR_Client) => {
        try {
            // const RootResp = await sdk.sfmc.folder.search({
            //     contentType: 'dataextension',
            //     searchKey: 'CustomerKey',
            //     searchTerm: 'dataextension_default',
            // });

            // const rootId = RootResp && RootResp.Results && RootResp.Results[0] && RootResp.Results[0].ID;
            // const deFolders = await sdk.sfmc.folder.getSubfoldersRecursive({
            //     contentType: 'dataextension',
            //     categoryId: rootId,
            // });
            const properties = getProperties('DataFolder');
            const dataExtensionProperties = getProperties('DataExtension');
            const deFolders = await sdk.sfmc.client.soap.retrieveBulk('DataFolder', properties, {
                filter: {
                    leftOperand: 'Name',
                    operator: 'isNotNull',
                    rightOperand: '',
                },
            });

            const folderIds = deFolders.Results.map((folder: { [key: string]: any }) => ({
                id: folder.ID,
                name: folder.Name,
            }));

            const chunks = splitArrayIntoChunks(folderIds, 10);

            displayLine('Fetching Data Extensions...', 'progress');
            displayLine(`Total Data Extension Folders: ${folderIds.length}`, 'info');

            console.log(chunks);
            const requests = await Promise.all(
                chunks.map((chunk) => {
                    return sdk.sfmc.client.soap.retrieveBulk('DataExtension', dataExtensionProperties, {
                        filter: {
                            leftOperand: 'CategoryID',
                            operator: 'IN',
                            rightOperand: chunk.map((folder) => folder.id),
                        },
                    });
                })
            );

            console.log(requests);
            const requestResponses = requests
                .flat()
                .map((request) => request.Results)
                .flat()
                .filter(Boolean);
            requestResponses && displayLine(`Total Data Extensions: ${requestResponses.length}`, 'info');
            this.writeLocalFiles(requestResponses, 'data_extensions');

            return requestResponses;
        } catch (err: any) {
            err.message && displayLine(err.message, 'error');
            return err;
        }
    };

    auditContentBuilder = async (sdk: BLDR_Client) => {
        try {
            const ContentType = 'shared';
            const folderRequest = await sdk.sfmc.client.rest.getBulk('/asset/v1/content/categories?scope=Shared');
            const folderIds = folderRequest.items.map((folder: { [key: string]: any }) => {
                console.log(folder.name);

                return folder.id;
            });

            const chunks = splitArrayIntoChunks(folderIds, 5);
            displayLine('Fetching Content Builder Assets...', 'progress');
            displayLine(`Total Content Builder Folders: ${folderIds.length}`, 'info');
            displayLine(`Total Content Builder Chunks: ${chunks.length}`, 'info');

            const requests = await Promise.all(
                chunks.map(async (chunk, index) => {
                    const results = [];
                    const initSubRequest = await sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
                        page: {
                            page: 1,
                            pageSize: 500,
                        },
                        query: {
                            property: 'category.id',
                            simpleOperator: 'IN',
                            value: chunk,
                        },
                        sort: [{ property: 'id', direction: 'ASC' }],
                    });

                    results.push(...initSubRequest.items);
                    //get total pages based on initSubRequest.count and pageSize
                    const totalPages = Math.ceil(initSubRequest.count / 500);

                    for (let pageIter = 2; pageIter <= totalPages; pageIter++) {
                        const subRequest = await sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
                            page: {
                                page: pageIter,
                                pageSize: 500,
                            },
                            query: {
                                property: 'category.id',
                                simpleOperator: 'IN',
                                value: chunk,
                            },
                            sort: [{ property: 'id', direction: 'ASC' }],
                        });

                        results.push(...subRequest.items);
                    }

                    displayLine(`Chunk ${index}: ${chunk} - ${results.length}`, 'info');

                    return results;
                })
            );

            const webStudioRequest = await sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
                page: {
                    page: 1,
                    pageSize: 500,
                },
                query: {
                    property: 'assetType.name',
                    simpleOperator: 'IN',
                    value: [
                        'webpage',
                        'jscoderesource',
                        'jsoncoderesource',
                        'csscoderesource',
                        'textcoderesource',
                        'rsscoderesource',
                        'xmlcoderesource',
                    ],
                },
                sort: [{ property: 'id', direction: 'ASC' }],
            });

            const requestResponses = requests.flat();

            webStudioRequest &&
                webStudioRequest.items &&
                webStudioRequest.items.length &&
                requestResponses.push(...webStudioRequest.items);

            requestResponses && displayLine(`Total Content Builder Assets: ${requestResponses.length}`, 'info');

            const responseChunks = splitArrayIntoChunks(requestResponses, 600);
            responseChunks.map((chunk, index) => this.writeLocalFiles(chunk, `assets_${ContentType}_${index}`));
        } catch (err: any) {
            err.message && displayLine(err.message, 'error');
            return err;
        }
    };
}
