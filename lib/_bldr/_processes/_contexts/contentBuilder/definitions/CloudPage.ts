const setCloudPage = async (
    sfmcUpdateObject: {
        bldrId?: any;
        bldr: {
            bldrId: string;
        };
        id?: number;
        customerKey?: string;
        name: string;
        category?: {
            id: number;
            name: string;
            parentId: number;
            folderPath: string;
        };
        assetType: {
            name: string;
        };
        views?: any;
    },
    updatedContent: string
) => {
    // Update Content
    let returnObject: {
        id?: number;
        customerKey?: string;
        bldrId: any;
        name: string;
        assetType: {
            name: string;
            id: number;
        };
        category?: {
            id?: number;
            name?: string;
            parentId?: number;
            folderPath?: string;
        };
        views: any;
    } = {
        bldrId: sfmcUpdateObject.bldr.bldrId || sfmcUpdateObject.bldrId,
        name: sfmcUpdateObject.name,
        views: {
            html: {
                content: updatedContent,
            },
        },
        assetType: {
            name: 'webpage',
            id: 205,
        },
    };

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'category')) {
        returnObject.category = {
            id: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.id,
            name: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.name,
            parentId: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.parentId,
            folderPath: sfmcUpdateObject && sfmcUpdateObject.category && sfmcUpdateObject.category.folderPath,
        };
    }

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'id')) {
        returnObject.id = sfmcUpdateObject.id;
    }

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'customerKey')) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }

    return returnObject;
};

export { setCloudPage };
