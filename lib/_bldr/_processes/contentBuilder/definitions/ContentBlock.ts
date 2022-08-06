const SetContentBlock = (sfmcUpdateObject: {
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
}) => {
    console.log('in fn', sfmcUpdateObject)
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
        bldrId: sfmcUpdateObject.bldrId,
        name: sfmcUpdateObject.name,
        assetType: sfmcUpdateObject.assetType,
        category: {
            id: sfmcUpdateObject.category.id,
            name: sfmcUpdateObject.category.name,
            parentId: sfmcUpdateObject.category.parentId,
            folderPath: sfmcUpdateObject.category.folderPath,
        },
        content: sfmcUpdateObject.content,
    };

    if (sfmcUpdateObject.id) {
        returnObject.id = sfmcUpdateObject.id;
    }

    if (sfmcUpdateObject.customerKey) {
        returnObject.customerKey = sfmcUpdateObject.customerKey;
    }

    console.log('in fn return', returnObject)

    return returnObject;
};

export { SetContentBlock };
