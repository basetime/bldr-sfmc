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