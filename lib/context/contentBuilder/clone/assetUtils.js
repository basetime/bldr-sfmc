
const assetSupport = require('../../../utils/sfmc/assetSupport')

const { localCreateFile } = require('../../../utils/index')

const gatherAssets = async (folderPaths, client) => {
  try {
    const folderIds = folderPaths.map(({ id }) => id)
    const assetResp = await client.rest.post('/asset/v1/content/assets/query', {
      "page": {
        "page": 1,
        "pageSize": 150
      },
      "query": {
        "property": "category.id",
        "simpleOperator": "in",
        "value": folderIds
      },
      "sort": [
        {
          "property": "id",
          "direction": "ASC"
        }
      ]
    })

    return assetResp.items.map((asset) => {
      const path = folderPaths.find((folder) => folder.id === asset.category.id)
      asset.category.path = path.folderPath;

      // Create JSON structure for new asset post
      let post = {};
      post.name = asset.name
      post.assetType = asset.assetType;
      post.category = asset.category;

      if (asset.content) { post.content = asset.content };
      if (asset.meta) { post.meta = asset.meta }
      if (asset.slots) { post.slots = asset.slots }
      if (asset.views) { post.views = asset.views }

      return post
    })

  } catch (err) {
    console.log(err);
  }
}


const createEditableFiles = async (assets) => {
  for(let a = 0; a < assets.length; a++) {
    const asset = assets[a];
    const assetType = asset.assetType.name;
    const folderPath = asset.category.path;
    const fileName = asset.name;

    let content;
    let ext;
    let dirPath;

    if (
       // html content
      asset.hasOwnProperty('views') &&
      asset.views.hasOwnProperty('html') &&
      asset.views.html.hasOwnProperty('content') &&
      !asset.views.html.hasOwnProperty('slots')
    ) {
      content = asset.views.html.content;
      ext = '.html';
      dirPath = `${folderPath}/${fileName}${ext}`;
    } else if (
      // non-slot content block
      asset.hasOwnProperty('content') &&
      !asset.hasOwnProperty('slots')
    ) {
      content = asset.content;
      ext = '.html';
      dirPath = `${folderPath}/${fileName}${ext}`;
    } else if (
      // slit content block
      asset.hasOwnProperty('content') &&
      asset.hasOwnProperty('slots')
    ) {
      content = JSON.stringify(asset, null, 2);
      ext = '.json';
      dirPath = `${folderPath}/${fileName}${ext}`;
    } else if (
      // template content
      asset.hasOwnProperty('views') &&
      asset.views.hasOwnProperty('html') &&
      asset.views.html.hasOwnProperty('content') &&
      asset.views.html.hasOwnProperty('slots')
    ) {
      content = JSON.stringify(asset, null, 2);
      ext = '.json';
      dirPath = `${folderPath}/${fileName}${ext}`;
    } else {
      // unable to identify
      content = JSON.stringify(asset, null, 2);
      ext = '.json';
      dirPath = `${folderPath}/${fileName}${ext}`;
    }



    await localCreateFile(`${dirPath}`, content);
  }
}



module.exports.cloneAssets = async (folderPaths, client) => {
  console.log('cloning assets')
  const assets = await gatherAssets(folderPaths, client)
  await createEditableFiles(assets)
  return assets
}