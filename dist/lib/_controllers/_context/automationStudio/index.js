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
exports.AutomationStudioSwitch = void 0;
const automationActivities_1 = require("../../../_utils/bldrFileSystem/_context/automationStudio/automationActivities");
const _bldr_sdk_1 = require("../../../_bldr_sdk");
const display_1 = require("../../../_utils/display");
const flat_1 = __importDefault(require("flat"));
const CreateLocalFiles_1 = require("../../../_utils/bldrFileSystem/_context/automationStudio/CreateLocalFiles");
const CreateLocalFiles_2 = require("../../../_utils/bldrFileSystem/_context/contentBuilder/CreateLocalFiles");
const manifestJSON_1 = require("../../../_utils/bldrFileSystem/manifestJSON");
const state_1 = require("../../../_bldr/_processes/state");
const metrics_1 = require("../../../_utils/metrics");
const { allowTracking } = new state_1.State();
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const AutomationStudioSwitch = (req, argv) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bldr = yield (0, _bldr_sdk_1.initiateBldrSDK)();
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
                    let contentType = '';
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
                    const searchRequest = yield automationStudio.searchFolders({
                        contentType,
                        searchKey: 'Name',
                        searchTerm: searchTerm,
                    });
                    (0, display_1.displayLine)(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((obj) => {
                            (0, display_1.displayObject)((0, flat_1.default)(obj));
                        });
                    allowTracking() && (0, metrics_1.incrementMetric)(`req_searches_automationStudio_${contentType}_folders`);
                }
                else if (typeof argv.f === 'string' && !argv.f.includes(':')) {
                    const searchRequest = yield automationStudio.searchFolders({
                        contentType: 'automations',
                        searchKey: 'Name',
                        searchTerm: argv.f,
                    });
                    (0, display_1.displayLine)(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((obj) => {
                            (0, display_1.displayObject)((0, flat_1.default)(obj));
                        });
                    allowTracking() && (0, metrics_1.incrementMetric)(`req_searches_automationStudio_automations_folders`);
                }
                /**
                 * Search for AutomationStudio Assets
                 */
                if (typeof argv.a === 'string' && argv.a.includes(':')) {
                    const activity = argv.a.split(':')[1];
                    const searchTerm = argv._ && argv._[1];
                    const searchRequest = yield automationStudio.searchActivity(activity, searchTerm);
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((item) => (0, display_1.displayObject)(item));
                }
                else if (typeof argv.a === 'string' && !argv.a.includes(':')) {
                    const searchRequest = yield automationStudio.searchAssets({
                        searchKey: 'Name',
                        searchTerm: argv.a,
                    });
                    (0, display_1.displayLine)(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest.forEach((obj) => {
                        (0, display_1.displayObject)((0, flat_1.default)(obj));
                    });
                }
                break;
            case 'clone':
                (0, display_1.displayLine)(`Starting Clone`, 'info');
                /**
                 * Search for Automation Studio Folders
                 */
                if (typeof argv.f === 'string' && argv.f.includes(':')) {
                    const activity = argv.f.split(':')[1];
                    const categoryId = argv._ && argv._[1];
                    let contentType = '';
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
                    const searchRequest = yield automationStudio.gatherAutomationDefinitionsByCategoryId({
                        contentType,
                        categoryId,
                    });
                    if (!searchRequest || !searchRequest.assets || !searchRequest.folders) {
                        (0, display_1.displayLine)(`Unable to Clone Request`, 'error');
                        return;
                    }
                    const { assets, folders } = searchRequest;
                    const formattedAssetResponse = (yield assets) &&
                        Array.isArray(assets) &&
                        assets.map((asset) => {
                            const category = folders.find((folder) => folder.ID === asset.categoryId);
                            asset.assetType = (0, automationActivities_1.MappingByActivityType)(contentType);
                            asset.category = {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };
                            return asset;
                        });
                    const formattedAssetCategories = folders &&
                        Array.isArray(folders) &&
                        folders.map((category) => {
                            return {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };
                        });
                    yield (0, CreateLocalFiles_1.createAutomationStudioEditableFiles)(formattedAssetResponse);
                    yield (0, manifestJSON_1.updateManifest)('automationStudio', {
                        assets: formattedAssetResponse,
                        folders: formattedAssetCategories,
                    });
                    allowTracking() && (0, metrics_1.incrementMetric)(`req_clones_automationStudio_${contentType}_folders`);
                }
                else if (typeof argv.f === 'number') {
                    const cloneAutomationRequest = yield automationStudio.gatherAssetsByCategoryId({
                        contentType: 'automations',
                        categoryId: argv.f,
                    });
                    if (cloneAutomationRequest.assets.length === 0) {
                        (0, display_1.displayLine)('No items to clone', 'info');
                        return;
                    }
                    yield processAutomationCloneRequest(cloneAutomationRequest);
                }
                /**
                 * Search for Automation Studio Assets
                 */
                if (typeof argv.a === 'string' && argv.a.includes(':')) {
                    const activity = argv.a.split(':')[1];
                    const assetId = argv._ && argv._[1];
                    let contentType = '';
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
                    const searchRequest = yield automationStudio.gatherAutomationDefinitionsById({
                        contentType,
                        assetId,
                    });
                    if (!searchRequest || !searchRequest.assets || !searchRequest.folders) {
                        (0, display_1.displayLine)(`Unable to Clone Request`, 'error');
                        return;
                    }
                    const { assets, folders } = searchRequest;
                    const formattedAssetResponse = (yield assets) &&
                        Array.isArray(assets) &&
                        assets.map((asset) => {
                            const category = folders.find((folder) => folder.ID === asset.categoryId);
                            asset.assetType = (0, automationActivities_1.MappingByActivityType)(contentType);
                            asset.category = {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: `Automation Studio/${category.FolderPath}`,
                            };
                            return asset;
                        });
                    const formattedAssetCategories = folders &&
                        Array.isArray(folders) &&
                        folders.map((category) => {
                            return {
                                id: category.ID,
                                name: category.Name,
                                parentId: category.ParentFolder.ID,
                                folderPath: category.FolderPath,
                            };
                        });
                    yield (0, CreateLocalFiles_1.createAutomationStudioEditableFiles)(formattedAssetResponse);
                    yield (0, manifestJSON_1.updateManifest)('automationStudio', {
                        assets: formattedAssetResponse,
                        folders: formattedAssetCategories,
                    });
                }
                else if (typeof argv.a === 'string' && !argv.a.includes(':')) {
                    const cloneAutomationRequest = yield automationStudio.gatherAssetById(argv.a);
                    if (cloneAutomationRequest.assets.length === 0) {
                        (0, display_1.displayLine)('No items to clone', 'info');
                        return;
                    }
                    yield processAutomationCloneRequest(cloneAutomationRequest);
                }
                break;
        }
        return;
    }
    catch (err) {
        console.log(err);
    }
});
exports.AutomationStudioSwitch = AutomationStudioSwitch;
const processAutomationCloneRequest = (cloneAutomationRequest) => __awaiter(void 0, void 0, void 0, function* () {
    // Create Automation Assets
    cloneAutomationRequest &&
        cloneAutomationRequest.assets &&
        cloneAutomationRequest.assets.length &&
        (yield (0, CreateLocalFiles_1.createAutomationStudioEditableFiles)(cloneAutomationRequest.assets));
    // Create Automation Definitions
    cloneAutomationRequest &&
        cloneAutomationRequest.formattedAutomationDefinitions &&
        cloneAutomationRequest.formattedAutomationDefinitions.length &&
        (yield (0, CreateLocalFiles_1.createAutomationStudioEditableFiles)(cloneAutomationRequest.formattedAutomationDefinitions));
    yield (0, manifestJSON_1.updateManifest)('automationStudio', {
        assets: cloneAutomationRequest.assets,
    });
    yield (0, manifestJSON_1.updateManifest)('automationStudio', {
        assets: cloneAutomationRequest.formattedAutomationDefinitions,
    });
    (0, display_1.displayLine)(`>> Cloned ${cloneAutomationRequest.assets.length} Automations`);
    (0, display_1.displayLine)(`>> Cloned ${cloneAutomationRequest.formattedAutomationDefinitions.length} Definitions`);
    // Create Automation Dependencies
    Object.keys(cloneAutomationRequest.formattedAutomationDependencies) &&
        Object.keys(cloneAutomationRequest.formattedAutomationDependencies).forEach((context) => __awaiter(void 0, void 0, void 0, function* () {
            (0, display_1.displayLine)(`Cloning Dependencies: ${context}`, 'info');
            const contextDependencies = cloneAutomationRequest.formattedAutomationDependencies[context];
            contextDependencies &&
                contextDependencies.assets &&
                contextDependencies.assets.length &&
                (yield (0, CreateLocalFiles_2.createContentBuilderEditableFiles)(contextDependencies.assets));
            contextDependencies &&
                contextDependencies.assets &&
                contextDependencies.assets.length &&
                (yield (0, manifestJSON_1.updateManifest)(context, contextDependencies));
            (0, display_1.displayLine)(`>> Cloned ${contextDependencies.assets.length} ${context} Dependencies`);
        }));
});
