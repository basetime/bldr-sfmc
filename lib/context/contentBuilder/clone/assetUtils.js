const { localCreateFile, localFileExists, localCreateDir } = require('../../../utils/index')
const { cloneFoldersASC } = require('./folderUtils')

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


const getAssetById = async (id, client) => {
  try{
    if(!id) throw new Error('Asset ID is requred')

    let assetResp = await client.rest.get(`/asset/v1/content/assets/${id}`)
    assetResp = new Array(assetResp)


    return assetResp.map((asset) => {
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
    console.log(err)
  }
}

module.exports.createEditableFiles = async (assets) => {
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
    
    localCreateFile(`${dirPath}`, content);
  }
}



module.exports.cloneAssetsFromFolder = async (folderPaths, client) => {
  console.log('cloning assets')
  const assets = await gatherAssets(folderPaths, client)
  await this.createEditableFiles(assets)
  return assets
}


module.exports.cloneAssetFromId = async (id, client) => {
  const assets = await getAssetById(id, client);

  if (!assets.length)
    throw new Error(`No Asset Found for ${argv.a}`)

  const rootFolderName = assets[0].category.name;
  const parentId = assets[0].category.parentId;
  const path = await cloneFoldersASC(rootFolderName, parentId, client)
  assets[0].category.path = path.folderPath;

  return {
    assets: assets,
    folders: new Array(assets[0].category)
  }
}