module.exports.codesnippetblock = (asset) => {
  return {
    "bldrId": asset.bldrId,
    "name": asset.assetName,
    "assetType": {
      "id": 220,
      "name": "codesnippetblock",
      "displayName": "Code Snippet Block"
    },
    "category": {
      "id": asset.category.id,
      "name": asset.category.folderName,
      "parentId": asset.category.parentId,
      "folderPath": asset.category.folderPath
    },
    "content": asset.content
  }
}


module.exports.htmlemail = (asset) => {
  return {
    "name": asset.name,
    "data": {
      "email": {
        "options": {
          "characterEncoding": "utf-8"
        }
      }
    },
    "category": {
      "id": asset.category.id,
      "name": asset.category.folderName,
      "parentId": asset.category.parentId,
      "folderPath": asset.category.folderPath
    },
    "views": {
      "html": {
        "content": asset.content
      }
    },
    "assetType": {
      "name": "htmlemail",
      "displayName": "HTML Email",
      "id": 208
    }
  }
}