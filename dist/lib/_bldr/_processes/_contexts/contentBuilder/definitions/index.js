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
exports.updateContentBuilderAssetContent = exports.setContentBuilderDefinition = void 0;
const HTMLEmail_1 = require("./HTMLEmail");
const ContentBlock_1 = require("./ContentBlock");
const bldrFileSystem_1 = require("../../../../../_utils/bldrFileSystem");
const CloudPage_1 = require("./CloudPage");
const setContentBuilderDefinition = (sfmcUpdateObject, updatedContent) => __awaiter(void 0, void 0, void 0, function* () {
    let assetOutput;
    updatedContent = yield (0, bldrFileSystem_1.replaceBldrSfmcEnv)(updatedContent);
    switch (sfmcUpdateObject.assetType.name) {
        case 'webpage':
            assetOutput = updatedContent && (yield (0, CloudPage_1.setCloudPage)(sfmcUpdateObject, updatedContent));
            break;
        case 'htmlemail':
            assetOutput = updatedContent && (yield (0, HTMLEmail_1.setHTMLEmail)(sfmcUpdateObject, updatedContent));
            break;
        case 'htmlblock':
        case 'codesnippetblock':
        case 'jscoderesource':
        case 'jsoncoderesource':
        case 'csscoderesource':
        case 'textcoderesource':
        case 'rsscoderesource':
        case 'xmlcoderesource':
            assetOutput = updatedContent && (yield (0, ContentBlock_1.SetContentBlock)(sfmcUpdateObject, updatedContent));
            break;
        default:
            assetOutput = JSON.parse(updatedContent);
    }
    return assetOutput;
});
exports.setContentBuilderDefinition = setContentBuilderDefinition;
/**
 *
 */
const updateContentBuilderAssetContent = (asset, content) => {
    const assetType = (asset.assetType && asset.assetType.name) || null;
    switch (assetType) {
        case 'webpage':
        case 'htmlemail':
            asset.views.html.content = content;
            break;
        case 'htmlblock':
        case 'codesnippetblock':
        case 'jscoderesource':
        case 'jsoncoderesource':
        case 'csscoderesource':
        case 'textcoderesource':
        case 'rsscoderesource':
        case 'xmlcoderesource':
            asset.content = content;
            break;
        case 'textonlyemail':
            asset.views.text.content = content;
            break;
        default:
            asset = content;
    }
    return asset;
};
exports.updateContentBuilderAssetContent = updateContentBuilderAssetContent;
