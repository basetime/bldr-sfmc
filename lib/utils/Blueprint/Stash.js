const fs = require('fs')
const path = require('path')
const process = require('process')
const getFiles = require("node-recursive-directory")
const Column = require("../help/Column");
const utils = require("../utils");
const display = require('../displayStyles')
const { styles, width } = display.init();


module.exports = class Stash {
  constructor(bldr, localFile, store) {
    this.bldr = bldr;
    this.localFile = localFile;
    this.store = store;
  }


  async status() {
    const stashArr = await this._getStashArr();

    const headers = [
      new Column(`Staged Files`, width.c4)
    ]

    if (stashArr && stashArr.length) {
      const displayContent = stashArr.map((stashItem) => {
        return [
          new Column(`${stashItem.folderPath || stashItem.category.folderPath}`, width.c4)
        ]
      })
      display.render(headers, displayContent)
    } else {
      display.render([], [[new Column(`${styles.callout('No files stashed')}`, width.c4)]])
    }

  }


  async clear() {
    const instance = await this._stateInstance();
    await this.store.stash.set({ [instance]: { stash: [] } })
    await this.status()
  }

  async remove(argv) {
    console.log(argv)
  }


  _saveStash(instance, obj) {
    const instanceStash = this.store.stash.get(instance);
    const stashArr = (instanceStash && instanceStash.stash) || [] ;

    const bldrId = obj.bldrId ? obj.bldrId : null;
    const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldrId === bldrId)
    if (stashIndex === -1) {
      stashArr.push(obj)
    } else {
      stashArr[stashIndex] = obj
    }

    return this.store.stash.set({ [instance]: { stash: stashArr } })
  }


  async _getStashArr() {
    const instance = await this._stateInstance();
    const stash = this.store.stash.get(instance);
    return stash ? stash.stash : null;
  }



  async _setStashObj(dirPath, bldrObj, newAsset) {

    let obj = Array.isArray(bldrObj) ? bldrObj[0] : bldrObj;
    let filePath;

    if (obj.hasOwnProperty('category')) {
      filePath = obj.category.folderPath;
    } else {
      filePath = obj.folderPath;
    }

    console.log('set filepath', filePath)
    const file = fs.readFileSync(`${dirPath}${filePath}`)
    const fileType = filePath.includes('.html') ? 'html' : 'json';
    const fileContent = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);

    if (newAsset) {
      const categoryDetails = await this._getManifestFolderData(dirPath, filePath, obj)
      console.log(categoryDetails)
      const contentType = await utils.identifyAssetType(obj)

      console.log(categoryDetails)
      switch (contentType) {
        case 'html':
          obj.views.html.content = fileContent;
          break;
        case 'code-contentblock':
          obj.content = fileContent;
          break;
        case 'cb-contentblock':
        case 'cb-templatebased':
        default:
          obj = fileContent
      }


      if(categoryDetails){
        obj.category.id = categoryDetails.id;
        obj.category.parentId = categoryDetails.parentId;
      }

      return obj
    } else {

      return {
        bldrId: obj.bldrId,
        folderPath: filePath,
        fileContent
      }
    }

  }


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }



  async _getManifestFolderData(dirPath, filePath, obj){
    const manifestJSON = this.localFile._getManifest(dirPath);
    const ctx = utils.ctx(filePath)
    const folders = manifestJSON[ctx]['folders']

    const folderDetails = await utils.filePathDetails(filePath)
    const folderResp = folders.find(({folderPath}) => folderPath === folderDetails.folderPath)
    return folderResp
  }
}
