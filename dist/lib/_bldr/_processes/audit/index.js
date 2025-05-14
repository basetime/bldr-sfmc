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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = void 0;
const _bldr_sdk_1 = require("../../../_bldr_sdk");
const display_1 = require("../../../_utils/display");
const state_1 = require("../state");
const _utils_1 = require("../../_utils");
const fileSystem_1 = require("../../../_utils/fileSystem");
const json_2_csv_1 = require("json-2-csv");
const sfmc_soap_object_reference_1 = require("sfmc-soap-object-reference");
const fs_1 = __importDefault(require("fs"));
const { getState, allowTracking, debug } = new state_1.State();
const rawResponsesBasePath = './audit/raw_api_responses';
/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
class Audit {
    constructor() {
        /**
         * Initiate the setting of a Configuration
         * Prompts user input
         * Tests/Gathers all child business unit Names and MIDs
         * Saves configuration to config file
         * Sets configuration to state management file
         * @param argv
         *
         */
        this.initiateAudit = (argv) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sdk = yield (0, _bldr_sdk_1.initiateBldrSDK)();
                (0, fileSystem_1.createDirectory)(`${rawResponsesBasePath}`);
                const runAudit = () => __awaiter(this, void 0, void 0, function* () {
                    // await this.auditDataExtensions(sdk);
                    // await this.auditAutomations(sdk);
                    // await this.auditBulkSoap(sdk);
                    // await this.auditBulkRest(sdk);
                    yield this.auditContentBuilder(sdk);
                });
                yield runAudit().then(() => __awaiter(this, void 0, void 0, function* () {
                    // setTimeout(() => this.auditJSON(), 2000);
                }));
                // this.auditJSON();
            }
            catch (err) {
                (0, display_1.displayLine)('error is here', 'error');
                console.log(err);
                err.message && (0, display_1.displayLine)(err.message, 'error');
                return err;
            }
        });
        this.auditJSON = () => __awaiter(this, void 0, void 0, function* () {
            const output = {
                map: {},
                raw: {},
            };
            function findMatchingRawObjects(data, anchor) {
                // Get all keys under the "raw" object
                let rawKeys = Object.keys(data.raw);
                let mapKeys = Object.keys(data.map);
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
                const result = {
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
                                            .filter((value) => (itemString.includes(value) && value) || null)
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
                return Object.assign(Object.assign({}, result), { matches: result.matches, unused: (0, _utils_1.uniqueArrayByKey)(result.unused, 'name') });
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
                const dataRaw = fs_1.default.readFileSync(`./audit/raw_api_responses/json/${param}.json`);
                const dataStr = dataRaw && dataRaw.toString();
                const data = dataRaw && JSON.parse(dataStr);
                if (!data) {
                    (0, display_1.displayLine)(`No data found for ${param}`, 'error');
                    continue;
                }
                output['map'][param] = data
                    .map((item) => {
                    if (!item || !Object.keys(item).length) {
                        return null;
                    }
                    const keys = Object.keys(item);
                    const objectAuditKeys = {
                        name: item.name || item.Name,
                        ids: (keys &&
                            keys.length &&
                            keys.map((key) => (auditKeys.includes(key) && item[key]) || null).filter(Boolean)) ||
                            [],
                    };
                    return objectAuditKeys;
                })
                    .filter(Boolean);
                output['raw'][param] = data || {};
            }
            yield Promise.all(requestParams.map((param) => __awaiter(this, void 0, void 0, function* () {
                const matchingRawObjects = yield findMatchingRawObjects(output, param);
                // await this.writeCSV(matchingRawObjects.unused, `/unused/${param}`);
                yield this.writeCSV(matchingRawObjects.matches, `/matches-2/${param}`);
                return matchingRawObjects;
            })));
            // const auditKeys = ['ObjectID', 'CustomerKey', 'ID', 'objectId', 'customerKey', 'id'];
            // const dataRaw = fs.readFileSync(`./audit/raw_api_responses/json/automation_dependencies.json`);
            // console.log(dataRaw)
            // const data = JSON.parse(dataRaw.toString());
            // return data.map((item: any) => {
            //     const keys = Object.keys(item);
            //     const objectAuditKeys = keys.map((key) => (auditKeys.includes(key) && item[key]) || null).filter(Boolean);
            //     return objectAuditKeys;
            // });
        });
        this.writeCSV = (data, fileName) => __awaiter(this, void 0, void 0, function* () {
            (0, fileSystem_1.createFile)(`${rawResponsesBasePath}/csv/${fileName}.csv`, (0, json_2_csv_1.json2csv)(data));
        });
        this.writeJSON = (data, fileName) => __awaiter(this, void 0, void 0, function* () {
            (0, fileSystem_1.createFile)(`${rawResponsesBasePath}/json/${fileName}.json`, data);
        });
        this.writeLocalFiles = (data, fileName) => __awaiter(this, void 0, void 0, function* () {
            this.writeJSON(data, fileName);
            // this.writeCSV(data, fileName);
        });
        this.auditBulkRest = (sdk) => __awaiter(this, void 0, void 0, function* () {
            const requestParams = [
                'interaction/v1/interactions',
                // 'asset/v1/content/assets',
                // 'interaction/v1/eventDefinitions',
                // 'contacts/v1/attributeSetDefinitions',
            ];
            for (const r in requestParams) {
                const param = requestParams[r];
                const paramId = param.split('/')[param.split('/').length - 1].toLowerCase();
                (0, display_1.displayLine)(`Fetching ${param}...`, 'progress');
                const request = yield sdk.sfmc.client.rest.getBulk(param);
                // request.object = param;
                if (request && request.items) {
                    this.writeLocalFiles(request.items, paramId);
                }
            }
        });
        this.auditBulkSoap = (sdk) => __awaiter(this, void 0, void 0, function* () {
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
                let properties = (0, sfmc_soap_object_reference_1.getProperties)(param);
                if (param === 'EmailSendDefinition') {
                    properties = properties.filter((p) => !p.includes('DeliveryProfile') && !p.includes('SendWindowCloses'));
                }
                (0, display_1.displayLine)(`Fetching ${param}...`, 'progress');
                const request = yield sdk.sfmc.client.soap.retrieveBulk(param, properties, {
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
        });
        this.auditAutomations = (sdk) => __awaiter(this, void 0, void 0, function* () {
            const RootResp = yield sdk.sfmc.folder.search({
                contentType: 'automations',
                searchKey: 'Name',
                searchTerm: 'my automations',
            });
            const rootId = RootResp && RootResp.Results && RootResp.Results[0] && RootResp.Results[0].ID;
            const automationFolders = yield sdk.sfmc.folder.getSubfoldersRecursive({
                contentType: 'automations',
                categoryId: rootId,
            });
            const folderIds = automationFolders.map((folder) => ({
                id: folder.ID,
                name: folder.Name,
            }));
            folderIds.push(rootId);
            const chunks = (0, _utils_1.splitArrayIntoChunks)(folderIds, 10);
            (0, display_1.displayLine)('Fetching Automations...', 'progress');
            (0, display_1.displayLine)(`Total Automation Folders: ${folderIds.length}`, 'info');
            const mapFn = (folder) => __awaiter(this, void 0, void 0, function* () {
                const subResponse = yield sdk.cli.automationStudio.gatherAssetsByCategoryId({
                    contentType: 'automations',
                    categoryId: folder.id,
                });
                subResponse.assets &&
                    subResponse.assets.length &&
                    setTimeout(() => {
                        (0, display_1.displayLine)(`Fetching Automation Response from ${folder.name}: ${subResponse.assets.length}...`, 'progress');
                    }, 2000);
                return subResponse;
            });
            const requests = yield Promise.all(chunks.map((chunk, i) => __awaiter(this, void 0, void 0, function* () {
                (0, display_1.displayLine)(`Chunk array ${i}: ${chunk.length}`, 'info');
                const results = [];
                for (const folder of chunk) {
                    results.push(yield mapFn(folder));
                }
                return results;
            })));
            const requestResponses = requests.flat().flatMap((request) => request.assets);
            const requestDefinitionResponses = requests
                .flat()
                .flatMap((request) => request.formattedAutomationDefinitions);
            const requestDependenciesResponses = requests
                .flat()
                .flatMap((request) => request.formattedAutomationDependencies);
            requestResponses && (0, display_1.displayLine)(`Total Automations: ${requestResponses.length}`, 'info');
            this.writeLocalFiles(requestResponses, 'automations');
            this.writeLocalFiles(requestDefinitionResponses, 'automation_definitions');
            this.writeLocalFiles(requestDependenciesResponses, 'automation_dependencies');
            (0, fileSystem_1.createFile)(`${rawResponsesBasePath}/automations-raw.json`, requests);
        });
        this.auditDataExtensions = (sdk) => __awaiter(this, void 0, void 0, function* () {
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
                const properties = (0, sfmc_soap_object_reference_1.getProperties)('DataFolder');
                const dataExtensionProperties = (0, sfmc_soap_object_reference_1.getProperties)('DataExtension');
                const deFolders = yield sdk.sfmc.client.soap.retrieveBulk('DataFolder', properties, {
                    filter: {
                        leftOperand: 'Name',
                        operator: 'isNotNull',
                        rightOperand: '',
                    },
                });
                const folderIds = deFolders.Results.map((folder) => ({
                    id: folder.ID,
                    name: folder.Name,
                }));
                const chunks = (0, _utils_1.splitArrayIntoChunks)(folderIds, 10);
                (0, display_1.displayLine)('Fetching Data Extensions...', 'progress');
                (0, display_1.displayLine)(`Total Data Extension Folders: ${folderIds.length}`, 'info');
                console.log(chunks);
                const requests = yield Promise.all(chunks.map((chunk) => {
                    return sdk.sfmc.client.soap.retrieveBulk('DataExtension', dataExtensionProperties, {
                        filter: {
                            leftOperand: 'CategoryID',
                            operator: 'IN',
                            rightOperand: chunk.map((folder) => folder.id),
                        },
                    });
                }));
                console.log(requests);
                const requestResponses = requests
                    .flat()
                    .map((request) => request.Results)
                    .flat()
                    .filter(Boolean);
                requestResponses && (0, display_1.displayLine)(`Total Data Extensions: ${requestResponses.length}`, 'info');
                this.writeLocalFiles(requestResponses, 'data_extensions');
                return requestResponses;
            }
            catch (err) {
                err.message && (0, display_1.displayLine)(err.message, 'error');
                return err;
            }
        });
        this.auditContentBuilder = (sdk) => __awaiter(this, void 0, void 0, function* () {
            try {
                const folderRequest = yield sdk.sfmc.client.rest.getBulk('/asset/v1/content/categories');
                const folderIds = folderRequest.items.map((folder) => folder.id);
                const chunks = (0, _utils_1.splitArrayIntoChunks)(folderIds, 5);
                (0, display_1.displayLine)('Fetching Content Builder Assets...', 'progress');
                (0, display_1.displayLine)(`Total Content Builder Folders: ${folderIds.length}`, 'info');
                (0, display_1.displayLine)(`Total Content Builder Chunks: ${chunks.length}`, 'info');
                const requests = yield Promise.all(chunks.map((chunk, index) => __awaiter(this, void 0, void 0, function* () {
                    const results = [];
                    const initSubRequest = yield sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
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
                        const subRequest = yield sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
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
                    (0, display_1.displayLine)(`Chunk ${index}: ${chunk} - ${results.length}`, 'info');
                    return results;
                })));
                const webStudioRequest = yield sdk.sfmc.client.rest.post('/asset/v1/content/assets/query', {
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
                requestResponses && (0, display_1.displayLine)(`Total Content Builder Assets: ${requestResponses.length}`, 'info');
                const responseChunks = (0, _utils_1.splitArrayIntoChunks)(requestResponses, 600);
                responseChunks.map((chunk, index) => this.writeLocalFiles(chunk, `assets_${index}`));
            }
            catch (err) {
                err.message && (0, display_1.displayLine)(err.message, 'error');
                return err;
            }
        });
    }
}
exports.Audit = Audit;
