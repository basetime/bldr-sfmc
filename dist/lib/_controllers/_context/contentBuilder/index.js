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
exports.ContentBuilderSwitch = void 0;
const flat_1 = __importDefault(require("flat"));
const yargs_interactive_1 = __importDefault(require("yargs-interactive"));
const state_1 = require("../../../_bldr/_processes/state");
const _utils_1 = require("../../../_bldr/_utils");
const _bldr_sdk_1 = require("../../../_bldr_sdk");
const manifestJSON_1 = require("../../../_utils/bldrFileSystem/manifestJSON");
const CreateLocalFiles_1 = require("../../../_utils/bldrFileSystem/_context/contentBuilder/CreateLocalFiles");
const display_1 = require("../../../_utils/display");
const metrics_1 = require("../../../_utils/metrics");
const delete_confirm = require('../../../_utils/options/delete_confirm');
const { allowTracking, getState, debug } = new state_1.State();
/**
 * Flag routing for Config command
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 *
 */
const ContentBuilderSwitch = (req, argv) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bldr = yield (0, _bldr_sdk_1.initiateBldrSDK)();
        //@ts-ignore //TODO figure out why contentBuilder is throwing TS error
        const { contentBuilder } = bldr.cli;
        if (!bldr) {
            throw new Error('unable to load sdk');
        }
        // If authObject is not passed use the current set credentials to initiate SDK
        const currentState = yield getState();
        switch (req) {
            case 'search':
                /**
                 * Search for Content Builder Folders
                 */
                let searchRequest;
                if (argv.f) {
                    if (typeof argv.f === 'string' && argv.f.includes(':')) {
                        const searchFlag = argv.f.split(':')[1];
                        const searchTerm = argv._ && argv._[1];
                        switch (searchFlag) {
                            case 'shared':
                                searchRequest =
                                    (yield contentBuilder.searchFolders({
                                        contentType: 'asset-shared',
                                        searchKey: 'Name',
                                        searchTerm: searchTerm,
                                    })) || [];
                                debug('Search Request', 'info', searchRequest);
                                searchRequest &&
                                    (0, display_1.displayLine)(`${searchTerm} Search Results | ${searchRequest.length} Results`, 'info');
                                searchRequest &&
                                    searchRequest.length &&
                                    searchRequest.forEach((obj) => {
                                        (0, display_1.displayObject)((0, flat_1.default)(obj));
                                    });
                                allowTracking() && (0, metrics_1.incrementMetric)('req_searches_sharedContent_folders');
                                break;
                        }
                    }
                    else if ((typeof argv.f === 'string' && !argv.f.includes(':')) || argv.f === 'number') {
                        searchRequest =
                            (yield contentBuilder.searchFolders({
                                contentType: 'asset',
                                searchKey: 'Name',
                                searchTerm: argv.f,
                            })) || [];
                        debug('Search Request', 'info', searchRequest);
                        searchRequest &&
                            (0, display_1.displayLine)(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                        searchRequest &&
                            searchRequest.length &&
                            searchRequest.forEach((obj) => {
                                (0, display_1.displayObject)((0, flat_1.default)(obj));
                            });
                        allowTracking() && (0, metrics_1.incrementMetric)('req_searches_contentBuilder_folders');
                    }
                }
                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const searchRequest = (yield contentBuilder.searchAssets({
                        searchKey: 'Name',
                        searchTerm: argv.a,
                    })) || [];
                    debug('Search Request', 'info', searchRequest);
                    searchRequest && (0, display_1.displayLine)(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest &&
                        searchRequest.length &&
                        searchRequest.forEach((obj) => {
                            (0, display_1.displayObject)((0, flat_1.default)(obj));
                        });
                    allowTracking() && (0, metrics_1.incrementMetric)('req_searches_contentBuilder_assets');
                }
                break;
            case 'clone':
                (0, display_1.displayLine)(`Starting Clone`, 'info');
                /**
                 * Clone Content Builder Folders
                 */
                if (argv.f) {
                    if (typeof argv.f === 'string' && argv.f.includes(':')) {
                        const shared = argv.f.split(':')[1] === 'shared' ? true : false;
                        const searchTerm = argv._ && argv._[1];
                        const cloneRequest = yield contentBuilder.gatherAssetsByCategoryId({
                            contentType: 'asset',
                            categoryId: searchTerm,
                        }, shared);
                        debug('Clone Request', 'info', cloneRequest);
                        if (!cloneRequest.assets.length) {
                            (0, display_1.displayLine)('No assets returned, folder is likely empty or does not exist.', 'info');
                            return;
                        }
                        const isolatedFoldersUnique = cloneRequest &&
                            cloneRequest.folders &&
                            cloneRequest.folders.length &&
                            (0, _utils_1.uniqueArrayByKey)(cloneRequest.folders, 'id');
                        cloneRequest &&
                            cloneRequest.assets &&
                            cloneRequest.assets.length &&
                            (yield (0, CreateLocalFiles_1.createContentBuilderEditableFiles)(cloneRequest.assets));
                        cloneRequest.assets &&
                            cloneRequest.folders &&
                            (yield (0, manifestJSON_1.updateManifest)('sharedContent', {
                                assets: cloneRequest.assets,
                                folders: isolatedFoldersUnique || [],
                            }));
                        allowTracking() && (0, metrics_1.incrementMetric)('req_clones_sharedContent_folders');
                    }
                    else if ((typeof argv.f === 'string' && !argv.f.includes(':')) || typeof argv.f === 'number') {
                        (0, display_1.displayLine)(`Clone folder`, 'info');
                        const cloneRequest = yield contentBuilder.gatherAssetsByCategoryId({
                            contentType: 'asset',
                            categoryId: argv.f,
                        });
                        debug('Clone Request', 'info', cloneRequest);
                        if (!cloneRequest.assets || !cloneRequest.assets.length) {
                            (0, display_1.displayLine)('No assets returned, folder is likely empty or does not exist.', 'info');
                            return;
                        }
                        const isolatedFoldersUnique = cloneRequest &&
                            cloneRequest.folders &&
                            cloneRequest.folders.length &&
                            (0, _utils_1.uniqueArrayByKey)(cloneRequest.folders, 'id');
                        debug('Unique Folders', 'info', isolatedFoldersUnique);
                        debug('Assets', 'info', cloneRequest.assets);
                        cloneRequest &&
                            cloneRequest.assets &&
                            cloneRequest.assets.length &&
                            (yield (0, CreateLocalFiles_1.createContentBuilderEditableFiles)(cloneRequest.assets));
                        cloneRequest.assets &&
                            cloneRequest.folders &&
                            (yield (0, manifestJSON_1.updateManifest)('contentBuilder', {
                                assets: cloneRequest.assets,
                                folders: isolatedFoldersUnique || [],
                            }));
                        allowTracking() && (0, metrics_1.incrementMetric)('req_clones_contentBuilder_folders');
                    }
                }
                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    (0, display_1.displayLine)(`Clone asset`, 'info');
                    if (typeof argv.a === 'string' && argv.a.includes(':')) {
                        const legacy = false;
                        const shared = argv.a.split(':')[1] === 'shared' ? true : false;
                        const assetId = argv._ && argv._[1];
                        const cloneRequest = yield contentBuilder.gatherAssetById(assetId, legacy, shared);
                        if (!cloneRequest || !cloneRequest.assets || !cloneRequest.folders) {
                            (0, display_1.displayLine)(`Unable to Clone Request`, 'error');
                            return;
                        }
                        const { assets, folders } = cloneRequest;
                        const isolatedFoldersUnique = folders && (0, _utils_1.uniqueArrayByKey)(folders, 'id');
                        assets && assets.length && (yield (0, CreateLocalFiles_1.createContentBuilderEditableFiles)(assets));
                        assets &&
                            folders &&
                            (yield (0, manifestJSON_1.updateManifest)('sharedContent', {
                                assets: assets,
                                folders: isolatedFoldersUnique,
                            }));
                        allowTracking() && (0, metrics_1.incrementMetric)('req_clones_sharedContent_assets');
                    }
                    else if ((typeof argv.a === 'string' && !argv.a.includes(':')) || typeof argv.a === 'number') {
                        const cloneRequest = yield contentBuilder.gatherAssetById(argv.a);
                        debug('Clone Request', 'info', cloneRequest);
                        if (!cloneRequest || !cloneRequest.assets || !cloneRequest.folders) {
                            (0, display_1.displayLine)(`Unable to Clone Request, asset might not exist`, 'error');
                            return;
                        }
                        const { assets, folders } = cloneRequest;
                        const isolatedFoldersUnique = folders && (0, _utils_1.uniqueArrayByKey)(folders, 'id');
                        const assetsToCreate = assets && !Array.isArray(assets) ? [assets] : assets;
                        assetsToCreate &&
                            assetsToCreate.length &&
                            (yield (0, CreateLocalFiles_1.createContentBuilderEditableFiles)(assetsToCreate));
                        assetsToCreate &&
                            folders &&
                            (yield (0, manifestJSON_1.updateManifest)('contentBuilder', {
                                assets: assetsToCreate,
                                folders: isolatedFoldersUnique,
                            }));
                        allowTracking() && (0, metrics_1.incrementMetric)('req_clones_contentBuilder_assets');
                    }
                }
                break;
            case 'delete':
                if (argv.f) {
                    // TODO: need to use only supplied folder and subfolders, not foldersFromMiddle function
                    const deleteRequest = yield contentBuilder.gatherAssetsByCategoryId({
                        contentType: 'asset',
                        categoryId: argv.f,
                    });
                    const { assets, folders } = deleteRequest;
                    const assetIds = assets && assets.length && assets.map((asset) => asset.id);
                    let folderIds = folders && folders.length && folders.map((folder) => folder.ID);
                    //folderIds = folderIds && folderIds.sort((a, b) => b.ID - a.ID)
                    if (assetIds && assetIds.length) {
                        for (const a in assetIds) {
                            const assetId = assetIds[a];
                            const deleteRequest = yield bldr.sfmc.asset.deleteAsset(assetId);
                            if (deleteRequest === 'OK') {
                                (0, display_1.displayLine)(`AssetId ${assetId} has been deleted`, 'success');
                            }
                        }
                    }
                    (0, display_1.displayLine)(`Please Note: folders have not been deleted. Working on it though!`, 'info');
                    allowTracking() && (0, metrics_1.incrementMetric)('req_clones_contentBuilder_assets');
                }
                if (argv.a) {
                    if (argv['force']) {
                        const deleteRequest = yield bldr.sfmc.asset.deleteAsset(argv.a);
                        if (deleteRequest === 'OK') {
                            (0, display_1.displayLine)(`AssetId ${argv.a} has been deleted`, 'success');
                            allowTracking() && (0, metrics_1.incrementMetric)('req_deletes_contentBuilder_assets');
                        }
                    }
                    else {
                        (0, yargs_interactive_1.default)()
                            .usage('$bldr init [args]')
                            .interactive(delete_confirm)
                            .then((initResults) => __awaiter(void 0, void 0, void 0, function* () {
                            if (initResults.confirmDelete) {
                                const deleteRequest = yield bldr.sfmc.asset.deleteAsset(argv.a);
                                if (deleteRequest === 'OK') {
                                    (0, display_1.displayLine)(`AssetId ${argv.a} has been deleted`, 'success');
                                    (0, display_1.displayLine)(`Please Note: folders have not been deleted. Working on it though!`, 'info');
                                    allowTracking() && (0, metrics_1.incrementMetric)('req_deletes_contentBuilder_assets');
                                }
                            }
                        }));
                    }
                }
                break;
        }
        return;
    }
    catch (err) {
        console.log(err);
    }
});
exports.ContentBuilderSwitch = ContentBuilderSwitch;
