const setHTMLEmail = async (sfmcUpdateObject: {
    bldr: {
        bldrId: string;
    }
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
        bldrId: sfmcUpdateObject.bldr.bldrId ,
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
        views: sfmcUpdateObject.views,
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
