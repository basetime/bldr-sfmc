const setHTMLEmail = (sfmcUpdateObject: {
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
    content: string;
}) => {
    return {
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
        },
        views: {
            html: {
                content: sfmcUpdateObject.content,
            },
        },
        assetType: {
            name: 'htmlemail',
            displayName: 'HTML Email',
            id: 208,
        },
    };
};

export { setHTMLEmail };
