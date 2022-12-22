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
exports.setCloudPage = void 0;
const setCloudPage = (sfmcUpdateObject, updatedContent) => __awaiter(void 0, void 0, void 0, function* () {
    // Update Content
    let returnObject = {
        bldrId: sfmcUpdateObject.bldr.bldrId || sfmcUpdateObject.bldrId,
        name: sfmcUpdateObject.name,
        views: {
            html: {
                content: updatedContent,
            },
        },
        assetType: {
            name: 'webpage',
            id: 205,
        },
    };
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'category')) {
        returnObject.category = {
            id: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.id,
            name: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.name,
            parentId: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.parentId,
            folderPath: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.folderPath,
        };
    }
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'id')) {
        returnObject.id = sfmcUpdateObject.id;
    }
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'customerKey')) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }
    return returnObject;
});
exports.setCloudPage = setCloudPage;
