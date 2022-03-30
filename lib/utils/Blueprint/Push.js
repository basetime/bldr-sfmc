const fs = require('fs');
const path = require('path')
const remove = require('lodash.remove');
const process = require('process')
const cliFormat = require('cli-format')
const utils = require('../utils');
const contextMap = require('../contextMap')
const Column = require("../help/Column")
const display = require('../displayStyles');
const { styles, width } = display.init();


module.exports = class Push {
  constructor(bldr, localFile, contextMap, store) {
    this.bldr = bldr;
    this.localFile = localFile;
    this.contextMap = contextMap;
    this.store = store;
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
    const rootPath = this.localFile._getRootPath(contextMap);
    const manifestPath = `${rootPath}.local.manifest.json`;
    const manifestJSON = this.localFile._parseJSON(manifestPath);
    const contextArr = this.contextMap.map((ctx) => ctx.context)

    for (const ctx in manifestJSON) {

      if (contextArr.includes(ctx)) {
        const manifestAssets = manifestJSON[ctx]['assets'];
        const postAssets = await this._isolateManifestAssetsForUpdate(manifestAssets, bldrIds);
        const updatedManifestAssets = await this._updateManifestAssets(postAssets, stashJSON);
        await this.localFile.manifestJSON(ctx, { assets: updatedManifestAssets }, rootPath);
        const updatedStash = await this._postToSFMC(updatedManifestAssets, stashJSON.stash);
        stashJSON.stash = updatedStash.stashArr;
        stash.set(instance, stashJSON)

        if (updatedStash && updatedStash.success && updatedStash.success.length !== 0) {
          const successHeaders = [
            new Column(`${styles.command('Updated Assets')}`, width.c2)
          ]

          const successDisplayContent = updatedStash.success.map((result) => {
            return [
              new Column(`${result}`, width.c2)
            ]
          })

          display.render(successHeaders, successDisplayContent)
        }


        if (updatedStash && updatedStash.errors && updatedStash.errors.length !== 0) {
          const errorsHeaders = [
            new Column(`${styles.error('Errored Asset')}`, width.c2),
            new Column(`${styles.error('Errored Message')}`, width.c2)
          ]

          const errorsDisplayContent = updatedStash.errors.map((result) => {
            return [
              new Column(`${result.name}`, width.c2),
              new Column(`${result.error}`, width.c2)
            ]
          })

          display.render(errorsHeaders, errorsDisplayContent)
        }
      }
    }

  }


  async _postToSFMC(updatedManifestAssets, stashArr) {
    const success = [];
    const errors = [];

    for (const a in updatedManifestAssets) {
      const asset = updatedManifestAssets[a];
      const bldrId = asset.bldrId;
      const patch = await this.bldr.asset.putAsset(asset)

      if (patch.status !== 200 && !patch.id) {
        errors.push({
          name: asset.name,
          error: patch.statusText
        })
      } else {
        success.push(patch.name)
        remove(stashArr, (item) => item.bldrId === bldrId)
      }
    }

    return {
      stashArr,
      success,
      errors
    }
  }


  async _updateManifestAssets(postAssets, stashJSON) {

    const updates = postAssets.map((asset) => {

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

    return updates
  }


  _isolateManifestAssetsForUpdate(manifestAssets, bldrIds) {
    // isolate post assets
    const postAssets = manifestAssets.map((asset) => {
      const bldrId = asset.bldrId;
      if (bldrIds.includes(bldrId))
        return asset
    })

    return postAssets.filter(Boolean)
  }
}
