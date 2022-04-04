const yargsInteractive = require("yargs-interactive");
const coreConfigurationOptions = require("../options");
const assetDefinitions = require('../sfmc_api_definitions')
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
        const manifestFolders = manifestJSON[ctx]['folders']
        const postAssets = await this._isolateManifestAssetsForUpdate(manifestAssets, bldrIds);
        const updatedManifestAssets = await this._updateManifestAssets(postAssets, stashJSON);
        const newAssets = await this._isolateNewAssets(manifestAssets, stashJSON, manifestFolders);

        console.log('stash', JSON.stringify(stashJSON, null, 2))
        console.log('updatedManifestAssets', updatedManifestAssets)
        console.log('newAssets', newAssets)
        await this.updateSFMCAssets(updatedManifestAssets, stashJSON, rootPath, ctx, instance);
        await this.updateSFMCAssets(newAssets, stashJSON, rootPath, ctx, instance);
      }
    }
  }


  async updateSFMCAssets(apiAssets, stashJSON, rootPath, ctx, instance) {
    const updatedStash = await this._postToSFMC(ctx, apiAssets, stashJSON.stash, rootPath);
    await this.localFile.manifestJSON(ctx, { assets: updatedStash.success }, rootPath);
    stashJSON.stash = updatedStash.stashArr;
    this.store.stash.set(instance, stashJSON)

    if (updatedStash && updatedStash.success && updatedStash.success.length !== 0) {
      const successHeaders = [
        new Column(`${styles.command('Created/Updated Assets')}`, width.c2)
      ]

      const successDisplayContent = updatedStash.success.map((result) => {
        return [
          new Column(`${result.name}`, width.c2)
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



  async _postToSFMC(ctx, apiAssets, stashArr, rootPath) {
    const success = [];
    const errors = [];

    for (const a in apiAssets) {
      const asset = apiAssets[a];
      const bldrId = asset.bldrId;
      const folderPath = asset.category.folderPath;

      let resp;
      if (asset.hasOwnProperty('create') && asset.create) {
        let createObj = asset;
        delete createObj.create;

        console.log('Pre-Post Asset', createObj)
        resp = await this.bldr.asset.postAsset(createObj)
      } else {
        resp = await this.bldr.asset.putAsset(asset)
      }

      if (resp.status !== 200 && !resp.id) {
        errors.push({
          name: asset.name,
          error: resp.statusText
        })
      } else {

        if (!asset.hasOwnProperty('id'))
          asset.id = resp.id;

        if (!asset.hasOwnProperty('customerKey'))
          asset.customerKey = resp.customerKey;

        if (asset.hasOwnProperty('create'))
          delete asset.create

        success.push(asset)
        this.localFile.appendBLDR({
          folderPath,
          bldrId,
          id: asset.id,
          context: ctx
        }, rootPath)

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


    console.log(postAssets.filter(Boolean))
    return postAssets.filter(Boolean)
  }


  _isolateNewAssets(manifestAssets, stashJSON, manifestFolders) {
    // isolate post assets
    const manifestBldrIds = manifestAssets.map((asset) => asset.bldrId)

    const postAssets = stashJSON.stash.map((stashItem) => {
      return stashItem.hasOwnProperty('create') && stashItem.create && stashItem
    })

    console.log(postAssets.filter(Boolean))
    return postAssets.filter(Boolean)
  }
}
