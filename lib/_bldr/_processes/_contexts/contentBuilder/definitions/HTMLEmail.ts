import { updateContentBuilderAssetContent } from ".";

const setHTMLEmail = async (sfmcUpdateObject: {
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
    };
    views?: any
}, updatedContent: string) => {
    // Update Content
    const updatedSFMCObject = sfmcUpdateObject.views && await updateContentBuilderAssetContent(sfmcUpdateObject, updatedContent);
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
        data: any;
        views: any;
    } = {
        bldrId: updatedSFMCObject.bldrId,
        name: updatedSFMCObject.name,
        data: {
            email: {
                options: {
                    characterEncoding: 'utf-8',
                },
            },
        },
        category: {
            id: updatedSFMCObject.category.id,
            name: updatedSFMCObject.category.name,
            parentId: updatedSFMCObject.category.parentId,
            folderPath: updatedSFMCObject.category.folderPath,
        },
        views: updatedSFMCObject.views,
        assetType: {
            name: 'htmlemail',
            id: 208,
        },
    };


    // Append keys for update flow
    if (sfmcUpdateObject.id) {
        returnObject.id = sfmcUpdateObject.id;
    }

    if (sfmcUpdateObject.customerKey) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }


    return returnObject
};

export { setHTMLEmail };
