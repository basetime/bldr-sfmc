import { setHTMLEmail } from './HTMLEmail';
import { SetContentBlock } from './ContentBlock';
import { replaceBldrSfmcEnv } from '../../../../../_utils/bldrFileSystem';
import { setCloudPage } from './CloudPage';

const setContentBuilderDefinition = async (
    sfmcUpdateObject: {
        bldrId?: string;
        bldr: {
            bldrId: string;
        };
        id?: number;
        customerKey?: string;
        name: string;
        category: {
            id: number;
            name: string;
            parentId: number;
            folderPath: string;
        };
        assetType: {
            name: string;
            id: number;
        };
        content?: string;
        views?: any;
    },
    updatedContent: string
) => {
    let assetOutput;
    updatedContent = await replaceBldrSfmcEnv(updatedContent);
    switch (sfmcUpdateObject.assetType.name) {
        case 'webpage':
            assetOutput = updatedContent && (await setCloudPage(sfmcUpdateObject, updatedContent));
            break;
        case 'htmlemail':
            assetOutput = updatedContent && (await setHTMLEmail(sfmcUpdateObject, updatedContent));
            break;
        case 'htmlblock':
        case 'codesnippetblock':
        case 'jscoderesource':
        case 'jsoncoderesource':
        case 'csscoderesource':
        case 'textcoderesource':
        case 'rsscoderesource':
        case 'xmlcoderesource':
            assetOutput = updatedContent && (await SetContentBlock(sfmcUpdateObject, updatedContent));
            break;
        default:
            assetOutput = JSON.parse(updatedContent);
    }

    return assetOutput;
};

/**
 *
 */
const updateContentBuilderAssetContent = (asset: any, content: string) => {
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

export { setContentBuilderDefinition, updateContentBuilderAssetContent };
