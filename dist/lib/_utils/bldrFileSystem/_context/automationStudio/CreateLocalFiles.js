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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutomationStudioEditableFiles = void 0;
const bldr_config_1 = require("../../../../_bldr/_processes/_userProcesses/bldr_config");
const fileSystem_1 = require("../../../fileSystem");
const display_1 = require("../../../display");
const { updateFilesFromConfiguration } = new bldr_config_1.User_BLDR_Config();
/**
 *
 * @param assets
 */
const createAutomationStudioEditableFiles = (assets) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        for (const a in assets) {
            const asset = assets[a];
            const assetType = asset.assetType || null;
            const assetTypeName = assetType && assetType.name;
            const fileName = asset.name || asset.Name;
            let folderPath = asset.category.folderPath || (assetType && assetType.folder);
            if (asset && asset.hasBeenDeleted && asset.hasBeenDeleted === true) {
                (0, display_1.displayLine)(`Error Creating File [local | ${assetTypeName}]: Automation Definition Deleted`, 'error');
                return;
            }
            folderPath === 'my automations' ? 'Automation Studio/my automations' : folderPath;
            folderPath = folderPath.includes('Automation Studio') ? folderPath : `Automation Studio/${folderPath}`;
            let content;
            let ext;
            let dirPath;
            let assetIdKey;
            switch (assetTypeName) {
                case 'queryactivity':
                    content = asset.queryText;
                    ext = '.sql';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                case 'ssjsactivity':
                    content = asset.script;
                    ext = '.js';
                    dirPath = `${folderPath}/${fileName}${ext}`;
                    break;
                default:
                    content = JSON.stringify(asset, null, 2);
                    ext = '.json';
                    dirPath = `${folderPath}/${fileName}${ext}`;
            }
            content = yield updateFilesFromConfiguration(content);
            const createFileResult = yield (0, fileSystem_1.createFile)(dirPath, content);
            createFileResult &&
                (0, display_1.displayLine)(`Successfully Created [local | ${assetTypeName}]: ${asset.name || asset.Name}`, 'success');
            !createFileResult &&
                (0, display_1.displayLine)(`Error Creating File [local | ${assetTypeName}]: ${asset.name || asset.Name}`, 'error');
        }
    }
    catch (err) {
        (0, display_1.displayLine)(`ERROR: ${err.message}`);
    }
});
exports.createAutomationStudioEditableFiles = createAutomationStudioEditableFiles;
