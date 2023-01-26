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
exports.SetContentBlock = void 0;
const SetContentBlock = (sfmcUpdateObject, updatedContent) => __awaiter(void 0, void 0, void 0, function* () {
    let returnObject = {
        bldrId: sfmcUpdateObject.bldr.bldrId || sfmcUpdateObject.bldrId,
        name: sfmcUpdateObject.name,
        assetType: sfmcUpdateObject.assetType,
        category: {
            id: sfmcUpdateObject.category.id,
            name: sfmcUpdateObject.category.name,
            parentId: sfmcUpdateObject.category.parentId,
            folderPath: sfmcUpdateObject.category.folderPath,
        },
        content: updatedContent,
    };
    //Append keys for update flow
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'id')) {
        returnObject.id = sfmcUpdateObject.id;
    }
    //Append keys for update flow
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'customerKey')) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'businessUnitAvailability')) {
        returnObject.businessUnitAvailability = sfmcUpdateObject.businessUnitAvailability;
    }
    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'sharingProperties')) {
        returnObject.sharingProperties = sfmcUpdateObject.sharingProperties;
    }
    return returnObject;
});
exports.SetContentBlock = SetContentBlock;
