const fs = require('fs')
const path = require('path')
const process = require('process')
const getFiles = require("node-recursive-directory")
const Column = require("../help/Column");
const utils = require("../utils");
const display = require('../displayStyles')
const contextMap = require('../contextMap')
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
      const displayContent = stashArr.map(({ folderPath }) => {
        return [
          new Column(`${folderPath}`, width.c4)
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
    const stashArr = (instanceStash && instanceStash.stash) || [];
    const bldrId = obj.bldr.bldrId ? obj.bldr.bldrId : null;
    const stashIndex = stashArr.findIndex((stashItem) => stashItem.bldr.bldrId === bldrId)
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



  async _setStashObj(dirPath, obj, newAsset) {
    const instance = await this._stateInstance();
    let filePath;

    // if (obj.bldr.hasOwnProperty('category') && obj.bldr.category.hasOwnProperty('folderPath')) {
    //   filePath = obj.bldr.category.folderPath;
    // } else {
    //   filePath = obj.bldr.folderPath;
    // }

    const file = fs.readFileSync(obj.path)
    const fileType = obj.path.includes('.html') ? 'html' : 'json';
    const fileContent = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);
    const categoryDetails = await this._getManifestFolderData(obj)

    if (newAsset) {
      // const contentType = await utils.identifyAssetType(obj)

      // console.log(categoryDetails)
      // switch (contentType) {
      //   case 'html':
      //     obj.views.html.content = fileContent;
      //     break;
      //   case 'code-contentblock':
      //     obj.content = fileContent;
      //     break;
      //   case 'cb-contentblock':
      //   case 'cb-templatebased':
      //   default:
      //     obj = fileContent
      // }


      // if(categoryDetails){
      //   obj.category.id = categoryDetails.id;
      //   obj.category.parentId = categoryDetails.parentId;
      // }

      return obj
    } else {
   
      obj.fileContent = fileContent;
      return this._saveStash(instance, obj)
    }

  }


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }



  async _getManifestFolderData(obj) {
    const dirPath = await this.localFile._getRootPath(contextMap)
    const manifestJSON = await this.localFile._getManifest(dirPath);
    const context = obj.bldr.context;
    const folders = manifestJSON[context]['folders']
    const folderDetails = await utils.filePathDetails(obj.path)
    const folderResp = folders.find(({folderPath}) => folderDetails.projectPath === folderPath)
    return folderResp
  }
}

// WORK OFF DEV, DELETE FEATURE BRANCH