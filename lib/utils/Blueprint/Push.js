const fs = require('fs');
const path = require('path')

const process = require('process')
const cliFormat = require('cli-format')
const utils = require('../utils');
const contextMap = require('../contextMap')

module.exports = class Push {
  constructor(bldr, add, localFile) {
    this.bldr = bldr;
    this.add = add;
    this.localFile = localFile;
  }

  async push(stateInit, stash) {
    // get state obj
    const stateObj = stateInit.get();
    const instance = stateObj.instance;

    // get stash for instance for state instance
    const stashRaw = stash.get(instance);
    const stashJSON = utils.assignObject(stashRaw);
    const bldrIds = stashJSON.stash.map(({ bldrId }) => bldrId);

    // get local manifest file
    const rootPath = this.add._getRootPath(contextMap);
    const manifestPath = `${rootPath}.local.manifest.json`;
    const manifestJSON = this.localFile._parseJSON(manifestPath);

    const context = this.localFile._getContextObj(contextMap);
    const manifestAssets = manifestJSON[context]['assets'];
    const postAssets = await this._isolateManifestAssetsForUpdate(manifestJSON, bldrIds);
    const updatedManifestAssets = await this._updateManifestAssets(postAssets, stashJSON);
    await this.localFile.manifestJSON(rootPath, context, { assets: updatedManifestAssets });
    await this._postToSFMC(updatedManifestAssets);

  }


  _postToSFMC(updatedManifestAssets) {
    console.log('updatedManifest', updatedManifestAssets)  
  }


  _updateManifestAssets(postAssets, stashJSON) {
    return postAssets.map((asset) => {
      const assetBldrId = asset.bldrId;
      const stashFile = stashJSON.stash.find((file) => {
        return file.bldrId === assetBldrId
      })

      const updatedFile = stashFile.fileContent;
      const contentType = utils.identifyAssetType(asset);

      switch (contentType) {
        case 'html':
          asset.views.html.content = updatedFile;
          break;
        case 'code-contentblock':
          asset.content = updatedFile;
          break;
        case 'cb-contentblock':
        case 'cb-templatebased':
        default:
          asset = updatedFile;
      }

      return asset
    })

  }


  _isolateManifestAssetsForUpdate(manifestJSON, bldrIds) {
    // isolate post assets
    const postAssets = manifestAssets.map((asset) => {
      const bldrId = asset.bldrId;
      if (bldrIds.includes(bldrId))
        return asset
    })

    return postAssets.filter(Boolean)
  }
}
