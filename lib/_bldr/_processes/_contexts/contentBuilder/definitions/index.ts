import { setHTMLEmail } from './HTMLEmail';
import { SetContentBlock } from './ContentBlock';

const setContentBuilderDefinition = (sfmcUpdateObject: {
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
    content: string;
    fileContent: string;
}) => {
    const assetType = sfmcUpdateObject.assetType.name;
    switch (assetType) {
        case 'htmlemail':
            return setHTMLEmail(sfmcUpdateObject);
        case 'htmlblock':
        case 'codesnippetblock':
            return SetContentBlock(sfmcUpdateObject);
    }
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
