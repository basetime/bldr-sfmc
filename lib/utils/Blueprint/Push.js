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
    const stashRaw = stash.get(instance)
    const stashJSON = utils.assignObject(stashRaw)
    const bldrIds = stashJSON.stash.map(({ bldrId }) => bldrId)

    // get local manifest file
    const rootPath = this.add._getRootPath(contextMap)
    const manifestPath = `${rootPath}.local.manifest.json`
    const manifestJSON = this.localFile._parseJSON(manifestPath)

    const rootArr = contextMap.map((ctx) => {
      const dirPath = path.resolve('./')
      if (dirPath.includes(ctx.root))
        return ctx.context

      return null
    })

    const context = rootArr.filter(Boolean)[0];
    const assetArr = manifestJSON[context]['assets'];
    
    // isolate post assets
    const postAssets = assetArr.map((asset) => {
      const bldrId = asset.bldrId;
      if (bldrIds.includes(bldrId))
        return asset
    })

    const postAssetsArr = postAssets.filter(Boolean)


    const updatedPost = postAssetsArr.map((asset) => {
      let content;
      const assetBldrId = asset.bldrId;
      const stashFile = stashJSON.stash.find((file) => {
        return file.bldrId === assetBldrId
      })

      const updatedFile = stashFile.fileContent;

      if (
        // html content
        asset.hasOwnProperty('views') &&
        asset.views.hasOwnProperty('html') &&
        asset.views.html.hasOwnProperty('content') &&
        !asset.views.html.hasOwnProperty('slots')
      ) {
        asset.views.html.content = updatedFile;

      } else if (
        // non-slot content block
        asset.hasOwnProperty('content') &&
        !asset.hasOwnProperty('slots')
      ) {
        asset.content = updatedFile;
      } else {
        asset = updatedFile
      }

      return asset

    })

    await this.localFile.manifestJSON(rootPath, context, { assets: updatedPost })

    // console.log(JSON.stringify(updatedPost, null, 2))
    // iterate through stash Array


    // find the correct asset in local manifest
    // update the content in local manifest
    // compile final array for what goes back into SFMC
    // iterate and make api calls to update SFMC assets

  }

}
