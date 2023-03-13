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
exports.setQueryActivity = void 0;
const automationActivities_1 = require("../../../../../_utils/bldrFileSystem/_context/automationStudio/automationActivities");
const setQueryActivity = (asset, updatedContent) => __awaiter(void 0, void 0, void 0, function* () {
    const assetType = yield (0, automationActivities_1.MappingByActivityType)(asset.assetType.name);
    if (assetType) {
        let returnObject = {
            name: asset.name,
            description: asset.description,
            categoryId: asset.categoryId,
            queryText: updatedContent,
            assetType,
        };
        if (asset.key) {
            returnObject.key = asset.key;
        }
        if (asset.queryDefinitionId) {
            returnObject.queryDefinitionId = asset.queryDefinitionId;
        }
        return returnObject;
    }
});
exports.setQueryActivity = setQueryActivity;
