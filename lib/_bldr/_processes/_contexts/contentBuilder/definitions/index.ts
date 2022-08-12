import { setHTMLEmail } from './HTMLEmail';
import { SetContentBlock } from './ContentBlock';

const setContentBuilderDefinition = async (sfmcUpdateObject: {
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
    views?: any
},
updatedContent: string
) => {
    let assetOutput;

    switch (sfmcUpdateObject.assetType.name) {
        case 'htmlemail':
            assetOutput = Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'views') && updatedContent && await setHTMLEmail(sfmcUpdateObject, updatedContent);
            break;
        case 'htmlblock':
        case 'codesnippetblock':
            assetOutput = updatedContent && await SetContentBlock(sfmcUpdateObject, updatedContent)
            break;
        default:
            assetOutput = JSON.parse(updatedContent);
    }

    return assetOutput
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
        case 'codesnippetblock':
        case 'htmlblock':
        case 'jscoderesource':
            asset.content = content;
            break;
        case 'textonlyemail':
            asset.views.text.content = content;
            break;
        default:
            asset = content
    }

    return asset;
};

export { setContentBuilderDefinition, updateContentBuilderAssetContent };
