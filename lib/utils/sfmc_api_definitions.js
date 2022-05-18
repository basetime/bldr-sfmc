module.exports.contentBlock = (asset, type) => {
    let assetType;
    if (type === 'codesnippetblock') {
        assetType = {
            id: 220,
            name: 'codesnippetblock',
        };
    } else if (type === 'htmlblock') {
        assetType = {
            id: 197,
            name: 'htmlblock',
        };
    }

    return {
        bldrId: asset.bldrId,
        name: asset.assetName,
        assetType,
        category: {
            id: asset.category.id,
            name: asset.category.folderName,
            parentId: asset.category.parentId,
            folderPath: asset.category.folderPath,
        },
        content: asset.content,
    };
};

module.exports.htmlemail = (asset) => {
    return {
        name: asset.assetName,
        data: {
            email: {
                options: {
                    characterEncoding: 'utf-8',
                },
            },
        },
        category: {
            id: asset.category.id,
            name: asset.category.folderName,
            parentId: asset.category.parentId,
            folderPath: asset.category.folderPath,
        },
        views: {
            html: {
                content: asset.content,
            },
        },
        assetType: {
            name: 'htmlemail',
            displayName: 'HTML Email',
            id: 208,
        },
    };
};

module.exports.ssjsactivity = (asset, assetType) => {
    return {
        name: asset.assetName,
        description: asset.name,
        categoryId: asset.category.id,
        script: asset.content,
        assetType,
    };
};
