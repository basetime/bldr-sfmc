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
        name: asset.name,
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


module.exports.queryDefinition = (asset) => {
    return {
        "name": "deExplorer_564910812c-147c",
        "key": "5fc012a4-9c23-4f45-8a4a-6ff4ace98f36",
        "description": "deExplorer_564910812c-147c",
        "queryText": "Select\nPostalCode\n\nfrom \n[Lead Gen Master]",
        "targetName": "deExplorer_564910812c-147c",
        "targetKey": "deExplorer_564910812c-147c",
        "targetId": "1afd8c61-4c9e-ec11-ba55-f40343cea350",
        "targetDescription": "deExplorer_564910812c-147c",
        "createdDate": "2022-03-07T13:25:47.383",
        "modifiedDate": "2022-04-14T07:19:15.703",
        "targetUpdateTypeId": 0,
        "targetUpdateTypeName": "Overwrite",
        "validatedQueryText": "SET NOCOUNT ON; SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;\r\n\r\nINSERT INTO C534001218.[deExplorer_564910812c-147c] ([PostalCode])\r\nSELECT querydef.[PostalCode]\r\nFROM (Select PostalCode  from  C534001218.[Lead Gen Master]) AS querydef \r\nSELECT @rcInsert = @@ROWCOUNT;;\r\n",
        "categoryId": 35075,
        "isFrozen": false,
        "assetType": {
          "api": "queries",
          "name": "queryactivity",
          "objectIdKey": "queryDefinitionId",
          "folder": "Automation Studio/Query"
        },
        "folderPath": "Automation Studio/Query",
        "bldrId": "694521c5-349e-42d9-8e11-9bec73422dde"
      }
}