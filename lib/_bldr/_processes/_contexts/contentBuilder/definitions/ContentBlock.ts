const SetContentBlock = async (
    sfmcUpdateObject: {
        bldrId?: any;
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
    },
    updatedContent: string
) => {
    let returnObject: {
        id?: number;
        customerKey?: string;
        bldrId: any;
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

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'customerKey')) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }

    return returnObject;
};

export { SetContentBlock };
