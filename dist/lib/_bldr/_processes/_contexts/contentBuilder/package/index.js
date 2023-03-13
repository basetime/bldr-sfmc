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
exports.setContentBuilderPackageAssets = void 0;
const GetContentBuilderAssetContent_1 = require("../../../../../_utils/bldrFileSystem/_context/contentBuilder/GetContentBuilderAssetContent");
const setContentBuilderPackageAssets = (packageOut, contextAssets) => __awaiter(void 0, void 0, void 0, function* () {
    packageOut['contentBuilder'] = {};
    return (packageOut['contentBuilder']['assets'] = contextAssets.map((asset) => {
        return {
            bldrId: asset.bldrId,
            name: asset.name,
            assetType: asset.assetType,
            category: {
                folderPath: (asset.category && asset.category.folderPath) || asset.folderPath,
            },
            content: (0, GetContentBuilderAssetContent_1.getContentBuilderAssetContent)(asset),
        };
    }));
});
exports.setContentBuilderPackageAssets = setContentBuilderPackageAssets;
