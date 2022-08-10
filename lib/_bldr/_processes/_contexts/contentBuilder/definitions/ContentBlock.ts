import { updateContentBuilderAssetContent } from '.';

const SetContentBlock = async (sfmcUpdateObject: {
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
    fileContent: string;
    content: string;
}) => {
    console.log('object in SetContentBlock', sfmcUpdateObject)
    // Update Content
    const updatedSFMCObject = await updateContentBuilderAssetContent(sfmcUpdateObject, sfmcUpdateObject.content);
    console.log('updated in SetContentBlock', updatedSFMCObject)

    let returnObject: {
        id?: number;
        customerKey?: string;
        bldrId: string;
        name: string;
        assetType: {
            name: string;
            id: number;
        };
        category: {
            id: number;
            name: string;
            parentId: number;
            folderPath: string;
        };
        content: string;
    } = {
        bldrId: updatedSFMCObject.bldrId,
        name: updatedSFMCObject.name,
        assetType: sfmcUpdateObject.assetType,
        category: {
            id: updatedSFMCObject.category.id,
            name: updatedSFMCObject.category.name,
            parentId: updatedSFMCObject.category.parentId,
            folderPath: updatedSFMCObject.category.folderPath,
        },
        content: updatedSFMCObject.content,
    };

    //Append keys for update flow
    if (sfmcUpdateObject.id) {
        returnObject.id = sfmcUpdateObject.id;
    }

    if (sfmcUpdateObject.customerKey) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }

    console.log('return', returnObject)
    return returnObject;
};

export { SetContentBlock };
