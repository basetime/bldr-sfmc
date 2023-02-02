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
exports.updateAutomationStudioAssetContent = exports.setAutomationStudioDefinition = void 0;
const ScriptActivity_1 = require("./ScriptActivity");
const QueryActivity_1 = require("./QueryActivity");
const setAutomationStudioDefinition = (sfmcUpdateObject, updatedContent) => __awaiter(void 0, void 0, void 0, function* () {
    const assetType = sfmcUpdateObject.assetType.name;
    let assetOutput;
    switch (assetType) {
        case 'ssjsactivity':
            assetOutput = yield (0, ScriptActivity_1.setScriptActivity)(sfmcUpdateObject, updatedContent);
            break;
        case 'queryactivity':
            assetOutput = yield (0, QueryActivity_1.setQueryActivity)(sfmcUpdateObject, updatedContent);
            break;
        default:
            assetOutput = JSON.parse(updatedContent);
    }
    return assetOutput;
});
exports.setAutomationStudioDefinition = setAutomationStudioDefinition;
/**
 *
 */
const updateAutomationStudioAssetContent = (asset, content) => {
    const assetType = (asset.assetType && asset.assetType.name) || null;
    switch (assetType) {
        case 'queryactivity':
            asset.queryText = content;
            break;
        case 'ssjsactivity':
            asset.script = content;
            break;
        default:
    }
    return asset;
};
exports.updateAutomationStudioAssetContent = updateAutomationStudioAssetContent;
