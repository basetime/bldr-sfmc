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
exports.DataExtensionSwitch = void 0;
const _bldr_sdk_1 = require("../../../_bldr_sdk");
const display_1 = require("../../../_utils/display");
const _utils_1 = require("../../../_bldr/_utils");
const flat_1 = __importDefault(require("flat"));
const CreateLocalFiles_1 = require("../../../_utils/bldrFileSystem/_context/dataExtension/CreateLocalFiles");
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
const DataExtensionSwitch = (req, argv) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bldr = yield (0, _bldr_sdk_1.initiateBldrSDK)();
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
                    const searchRequest = yield emailStudio.searchFolders({
                        contentType: 'dataextension',
                        searchKey: 'Name',
                        searchTerm: argv.f,
                    });
                    (0, display_1.displayLine)(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest.forEach((obj) => {
                        (0, display_1.displayObject)((0, flat_1.default)(obj));
                    });
                    allowTracking() && (0, metrics_1.incrementMetric)('req_searches_dataExtension_folders');
                }
                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const searchRequest = yield emailStudio.searchDataExtensions({
                        searchKey: 'Name',
                        searchTerm: argv.a,
                    });
                    (0, display_1.displayLine)(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info');
                    searchRequest.forEach((obj) => {
                        (0, display_1.displayObject)((0, flat_1.default)(obj));
                    });
                    allowTracking() && (0, metrics_1.incrementMetric)('req_searches_dataExtension_assets');
                }
                break;
            case 'clone':
                (0, display_1.displayLine)(`Starting Clone`, 'info');
                /**
                 * Clone Content Builder Folders
                 */
                if (argv.f) {
                    const cloneRequest = yield emailStudio.gatherAssetsByCategoryId({
                        contentType: 'dataextension',
                        categoryId: argv.f,
                    });
                    const { assets, folders } = cloneRequest;
                    const isolatedFoldersUnique = folders && (0, _utils_1.uniqueArrayByKey)(folders, 'id');
                    assets && assets.length && (yield (0, CreateLocalFiles_1.createEmailStudioEditableFiles)(assets));
                    assets &&
                        folders &&
                        (yield (0, manifestJSON_1.updateManifest)('dataExtension', {
                            assets: assets,
                            folders: isolatedFoldersUnique,
                        }));
                    allowTracking() && (0, metrics_1.incrementMetric)('req_clones_dataExtension_folders');
                }
                /**
                 * Search for Content Builder Assets
                 */
                if (argv.a) {
                    const cloneRequest = yield emailStudio.gatherAssetById(argv.a);
                    const { assets, folders } = cloneRequest;
                    const isolatedFoldersUnique = folders && (0, _utils_1.uniqueArrayByKey)(folders, 'id');
                    assets && assets.length && (yield (0, CreateLocalFiles_1.createEmailStudioEditableFiles)(assets));
                    assets &&
                        folders &&
                        (yield (0, manifestJSON_1.updateManifest)('dataExtension', {
                            assets: assets,
                            folders: isolatedFoldersUnique,
                        }));
                    allowTracking() && (0, metrics_1.incrementMetric)('req_clones_dataExtension_assets');
                }
                break;
        }
        return;
    }
    catch (err) {
        console.log(err);
    }
});
exports.DataExtensionSwitch = DataExtensionSwitch;
