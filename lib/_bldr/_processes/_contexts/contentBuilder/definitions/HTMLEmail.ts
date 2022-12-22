const setHTMLEmail = async (
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
        category: {
            id: number;
            name: string;
            parentId: number;
            folderPath: string;
        };
        data: any;
        views: any;
    } = {
        bldrId: sfmcUpdateObject.bldr.bldrId || sfmcUpdateObject.bldrId,
        name: sfmcUpdateObject.name,
        data: {
            email: {
                options: {
                    characterEncoding: 'utf-8',
                },
            },
        },
        category: {
            id: sfmcUpdateObject.category.id,
            name: sfmcUpdateObject.category.name,
            parentId: sfmcUpdateObject.category.parentId,
            folderPath: sfmcUpdateObject.category.folderPath,
        },
        views: {
            html: {
                content: updatedContent,
            },
        },
        assetType: {
            name: 'htmlemail',
            id: 208,
        },
    };

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'id')) {
        returnObject.id = sfmcUpdateObject.id;
    }

    if (Object.prototype.hasOwnProperty.call(sfmcUpdateObject, 'customerKey')) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }

    return returnObject;
};

export { setHTMLEmail };
