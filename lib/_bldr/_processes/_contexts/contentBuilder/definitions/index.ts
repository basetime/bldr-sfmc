import { setHTMLEmail } from './HTMLEmail';
import { SetContentBlock } from './ContentBlock';

const setContentBuilderDefinition = async (sfmcUpdateObject: {
    bldrId: string;
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
stashFileObject?: {
    fileContent?: string;
}) => {
    const assetType = sfmcUpdateObject.assetType.name;
    let assetOutput;

    switch (assetType) {
        case 'htmlemail':
            assetOutput = Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'views') && stashFileObject?.fileContent && setHTMLEmail(sfmcUpdateObject, stashFileObject.fileContent);
            break;
        case 'htmlblock':
        case 'codesnippetblock':
            assetOutput = stashFileObject?.fileContent && SetContentBlock(sfmcUpdateObject, stashFileObject.fileContent);
            break;
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
