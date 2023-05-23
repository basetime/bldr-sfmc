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
exports.updateManifest = void 0;
const bldr_config_1 = require("../../_bldr/_processes/_userProcesses/bldr_config");
const promises_1 = require("fs/promises");
const _utils_1 = require("../../_bldr/_utils");
const store_1 = require("../../_bldr_sdk/store");
const fileSystem_1 = require("../fileSystem");
const lodash_isequal_1 = __importDefault(require("lodash.isequal"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const fileSystem_2 = require("../fileSystem");
const _1 = require(".");
const { updateFilesFromConfiguration } = new bldr_config_1.User_BLDR_Config();
var ObjectIdKeys;
(function (ObjectIdKeys) {
    ObjectIdKeys[ObjectIdKeys["ssjsActivityId"] = 0] = "ssjsActivityId";
})(ObjectIdKeys || (ObjectIdKeys = {}));
//TODO try to make context enum type, was getting caught up on instanceDetails
const updateManifest = (context, content) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof content !== 'object') {
        throw new Error('Content needs to be an object');
    }
    if (!context) {
        throw new Error('Context is required');
    }
    const rootPath = (yield (0, fileSystem_2.getRootPath)()) || path_1.default.normalize('./');
    const manifestPath = path_1.default.normalize(`${rootPath}.local.manifest.json`);
    if (!(0, fileSystem_2.fileExists)(manifestPath)) {
        const init = {};
        const state = (0, _utils_1.assignObject)(store_1.state_conf.get());
        if (state) {
            const { instance, parentMID, activeMID } = state;
            yield (0, fileSystem_1.createFile)(manifestPath, JSON.stringify({
                instanceDetails: {
                    instance,
                    parentMID,
                    activeMID,
                },
            }, null, 2));
        }
        yield updateManifest(context, content);
        return;
    }
    // Read ManifestJSON file from root dir
    let manifestFile = yield (0, promises_1.readFile)(manifestPath);
    let manifestJSON = JSON.parse(manifestFile);
    // Siloed write for instance details
    if (context === 'instanceDetails' && !Object.prototype.hasOwnProperty.call(manifestJSON, context)) {
        manifestJSON[context] = content;
        fs_1.default.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2));
        return;
    }
    // Iterate through content object
    // Asset Types => asset/folder
    for (const assetType in content) {
        if (Object.prototype.hasOwnProperty.call(manifestJSON, context) &&
            Object.prototype.hasOwnProperty.call(manifestJSON[context], assetType)) {
            // @ts-ignore
            const manifestContextObject = manifestJSON[context];
            const AssetTypeItems = content[assetType];
            for (const i in AssetTypeItems) {
                const updateItem = AssetTypeItems[i];
                let itemId;
                let manifestContextItems = manifestContextObject[assetType];
                let manifestObj;
                if (assetType === 'assets') {
                    // Content Builder assets should have have item.id
                    // Automation Studio assets get an assetType object with the key for their ID
                    if (['contentBuilder', 'sharedContent'].includes(context)) {
                        itemId = updateItem.id;
                        manifestObj = manifestContextItems.find(({ id }) => id === itemId);
                    }
                    else if (context === 'automationStudio') {
                        const objectIdKey = updateItem && updateItem.assetType && updateItem.assetType.objectIdKey;
                        itemId =
                            objectIdKey &&
                                Object.prototype.hasOwnProperty.call(updateItem, objectIdKey) &&
                                updateItem[objectIdKey];
                        //@ts-ignore
                        manifestObj = manifestContextItems.find((item) => item[objectIdKey] === itemId);
                    }
                    else if (['dataExtension', 'sharedDataExtension'].includes(context)) {
                        itemId = updateItem.customerKey;
                        manifestObj = manifestContextItems.find(({ customerKey }) => customerKey === itemId);
                    }
                }
                else if (assetType === 'folders') {
                    itemId = updateItem.id;
                    manifestObj = manifestContextItems.find(({ id }) => id === itemId);
                }
                // If the item is not found based on the ID add it to the Context Items Array
                // If the item is found check that the items are equal
                if (typeof manifestObj === 'undefined') {
                    manifestContextItems = [...manifestContextItems, updateItem];
                }
                else {
                    if (!(0, lodash_isequal_1.default)(updateItem, manifestObj)) {
                        let updateIndex;
                        if (assetType === 'assets') {
                            if (['contentBuilder', 'sharedContent'].includes(context)) {
                                updateIndex = manifestContextItems.findIndex(({ id }) => id === updateItem.id);
                            }
                            else if (context === 'automationStudio') {
                                const objectIdKey = updateItem && updateItem.assetType && updateItem.assetType.objectIdKey;
                                let itemId = objectIdKey &&
                                    Object.prototype.hasOwnProperty.call(updateItem, objectIdKey) &&
                                    updateItem[objectIdKey];
                                updateIndex = manifestContextItems.findIndex((item) => itemId && item[itemId] === updateItem[itemId]);
                                updateItem.category = manifestObj.category;
                            }
                            else if (['dataExtension', 'sharedDataExtension'].includes(context)) {
                                itemId = updateItem.customerKey || updateItem.id;
                                updateIndex = manifestContextItems.findIndex(({ customerKey }) => customerKey === updateItem.customerKey);
                            }
                        }
                        else if (assetType === 'folders') {
                            itemId = updateItem.id;
                            updateIndex = manifestContextItems.findIndex(({ id }) => id === updateItem.id);
                        }
                        if (typeof updateIndex !== 'undefined') {
                            manifestContextItems[updateIndex] = updateItem;
                        }
                    }
                }
                manifestJSON[context][assetType] = manifestContextItems;
            }
        }
        else {
            if (!manifestJSON[context]) {
                manifestJSON[context] = {};
            }
            // @ts-ignore
            const assetObjects = content[assetType];
            // @ts-ignore
            manifestJSON[context][assetType] = [...assetObjects];
        }
    }
    let manifestStr = JSON.stringify(manifestJSON);
    manifestStr = yield (0, _1.scrubBldrSfmcEnv)(manifestStr);
    let updatedManifest = JSON.parse(manifestStr);
    yield fs_1.default.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));
});
exports.updateManifest = updateManifest;
