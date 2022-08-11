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
    fileContent: string
) => {
    let assetOutput;

    switch (sfmcUpdateObject.assetType.name) {
        case 'htmlemail':
            assetOutput = Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'views') && fileContent && await setHTMLEmail(sfmcUpdateObject, fileContent);
            break;
        case 'htmlblock':
        case 'codesnippetblock':
            assetOutput = fileContent && await SetContentBlock(sfmcUpdateObject, fileContent)
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
    }

    return asset;
};

export { setContentBuilderDefinition, updateContentBuilderAssetContent };
