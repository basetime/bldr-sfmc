const fs = require('fs');
const cliFormat = require('cli-format')
const utils = require('../../../utils');



module.exports = class CBClone {
  constructor(bldr, localFile, contextMap, store) {
    this.bldr = bldr;
    this.localFile = localFile;
    this.contextMap = contextMap;
    this.store = store;
  }

  async cloneFromFolder(argv, context) {
    try {
    const id = argv.f;
    // Get all subfolder data staring with a root Id provided by the user
    const folderPaths = await this.getFoldersRecursiveDESC(id);
    // Isolate all returned folder Ids for get asset filter
    const folderIds = await folderPaths.map(({ id }) => id);
    // Get all Content Builder assets based on the isolated folderIds Array
    const assetsResp = await this.bldr.asset.getByFolderArray(folderIds);
    // Format Asset Items to required key/values and append folder paths to objects
    const assetsPost = await this._formatDataForFile(assetsResp.items, folderPaths);
    // Create all directories and files
    await this.localFile.createEditableFiles(assetsPost, context);
    // Append or create .gitignore file
    await this.localFile.append(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`);
    // Update ManifestJSON file with responses
    await this.localFile.manifestJSON('contentBuilder', { folders: folderPaths }, null)
    await this.localFile.manifestJSON('contentBuilder', { assets: assetsPost }, null)
    }catch(err){
      console.log(err)
    }
  }


  async cloneFromID(id) {
    const assetResp = await this.bldr.asset.getById(id)

    if (!assetResp.length)
      throw new Error(`No Asset Found for ${argv.a}`)

    const folderPaths = [{
      id: assetResp[0].category.id,
      name: assetResp[0].category.name,
      parentId: assetResp[0].category.parentId,
      categoryType: 'asset'
    }]

    const folderPath = await this.setFolderPathRecursiveAsc(folderPaths[0])
    folderPaths[0].folderPath = folderPath;

    const assetsPost = await this._formatDataForFile(assetResp, folderPaths)
    await this.localFile.createEditableFiles(assetsPost, 'contentBuilder')

    // Append or create .gitignore file
    await this.localFile.append(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`);
    // Update ManifestJSON file with responses
    await this.localFile.manifestJSON('contentBuilder', { folders: folderPaths }, null)
    await this.localFile.manifestJSON('contentBuilder', { assets: assetsPost }, null)
  }



  async _formatDataForFile(results, folderPaths) {
    try {
      if (Array.isArray(results) && results.length !== 0) {
        const formatted = new Array()
        
        for(const r in results) {
          const asset = results[r]
          const bldrId = utils.guid();
          const searchPath = folderPaths.find(({ id }) => id === asset.category.id)
          const folderPath = searchPath ? searchPath.folderPath : '';
     

          // Create JSON structure for new asset post
          let post = {};
          post.id = asset.id;
          post.bldrId = bldrId;
          post.name = asset.name;
          post.customerKey = asset.customerKey;
          post.assetType = asset.assetType;
          post.category = asset.category;
          post.category.folderPath = folderPath;

          if (asset.content) { post.content = asset.content };
          if (asset.meta) { post.meta = asset.meta }
          if (asset.slots) { post.slots = asset.slots }
          if (asset.views) { post.views = asset.views }

          if(asset.assetType.displayName === 'Image'){
            post.name = asset.name.indexOf('.') === -1 ? asset.name : asset.name.substring(0, asset.name.indexOf('.'));
            post.publishedURL = asset.fileProperties.publishedURL;
            post.file = await this.bldr.asset.getImageFile(asset.id)
          }

           formatted.push(post)
        }

        return formatted
      }
    } catch (err) {
      console.log(err)
    }
  }



  async setFolderPathRecursiveAsc(folderObj) {
    let path = folderObj.name;
    let parentId = folderObj.parentId;

    console.log('test:', folderObj)
    if(parentId === 0)
      return path

    do {
      const folderResp = await this.bldr.folder.get('asset', parentId, false)
      const results = folderResp.Results[0];
      parentId = results.ParentFolder.ID;
      path = `${results.Name}/${path}`
    } while (parentId !== 0)

    return path
  }



  async getFoldersRecursiveDESC(id) {
    try {
      const rootID = id;
      let folders = [];
      let foldersOut = [];

      let rootResp = await this.bldr.folder.get('asset', id, false)
      rootResp = await this._formatFolderResponse(rootResp.Results, id)

      if (rootResp && rootResp.length !== 0) {
        let rootIdArray = rootResp.map((folder) => folder.id);
        folders.push(...rootIdArray);
        foldersOut = [...foldersOut, ...rootResp];
      }

      do {
        let folderId = folders[0];
        let resp = await this.bldr.folder.get('asset', folderId, true);
        resp = await this._formatFolderResponse(resp.Results, id)

        if (resp && resp.length !== 0) {
          let subfolderIdArray = resp.map((folder) => folder.id);
          folders.push(...subfolderIdArray);
          foldersOut = [...foldersOut, ...resp];
        }

        folders.shift();
      } while (folders.length !== 0);

      return this._formatFolderPaths(foldersOut)

    } catch (err) {
      console.log(err);
    }
  };



  _formatFolderResponse(folders, id) {
    if (folders && folders.length !== 0) {
      const map = folders.map((folder) => {
        return {
          id: folder.ID,
          name: folder.Name,
          parentId: folder.ParentFolder.ID,
          categoryType: folder.ContentType,
          rootFolder: id === folder.ID ? true : false
        }
      })

      return map
    }

    return []
  }


  async _formatFolderPaths(folders) {
    const foldersOut = [];
    let path = '';
    let parentId;
    let hasParent;

    for (const f in folders) {
      let folderObj = folders[f];
      let parentFolder;

      if (folderObj.rootFolder === true) {
        let parentResp = await this.bldr.folder.get('asset', folderObj.parentId, false)
        parentResp = await this._formatFolderResponse(parentResp.Results, folderObj.parentId)
        path += `${parentResp[0].name}/${folderObj.name}`;

      } else {
        parentId = folderObj.parentId
        hasParent = true;

        let establishedPath = foldersOut.find(({ id }) => id === parentId)

        if (establishedPath) {
          path = `${establishedPath.folderPath}/${folderObj.name}`
        } else {

          do {
            let parentFolder = await utils.getParentFolderFromArray(foldersArray, parentId)
            path += `/${parentFolder[0].name}`
            hasParent = parentFolder.length !== 0 ? true : false;
          } while (!hasParent)

          path += `/${folderObj.name}`
        }

      }

      folderObj.folderPath = `${path}`;
      foldersOut.push(folderObj)

      path = '';
    }

    return foldersOut
  }

}
