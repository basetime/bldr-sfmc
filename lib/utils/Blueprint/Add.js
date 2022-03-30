const fs = require('fs')
const path = require('path')
const process = require('process')
const getFiles = require("node-recursive-directory")
const Column = require("../help/Column");
const utils = require("../utils");
const display = require('../displayStyles')
const { styles, width } = display.init();


module.exports = class Add {
  constructor(localFile, stash, contextMap, store) {
    this.localFile = localFile;
    this.stash =stash;
    this.contextMap = contextMap;
    this.store = store;
  }


  async addAll() {
    let dirPath = await this.localFile._getRootPath(this.contextMap);
    let addPath = process.cwd();
    const bldrJSON = await this.localFile._getBldrJSON(dirPath, this.contextMap);
    const instance = await this._stateInstance()

    // if request is from root directory, iterate through supported context folders
    if (dirPath === './') {
      const contextArr = this.contextMap;

      for (let c = 0; c < contextArr.length; c++) {
        const context = contextArr[c]
        addPath = `./${context.root}`

        if(!this.localFile._fileExists(addPath))
          continue;

        const files = await getFiles(addPath, true); // add true
        await this._addAllToTemp(files, dirPath, bldrJSON, instance)
      }
    } else {
      const files = await getFiles(addPath, true); // add true
      await this._addAllToTemp(files, dirPath, bldrJSON, instance)
    }
  }



  async addFiles(argv) {
    const dirPath = await this.localFile._getRootPath(this.contextMap);
    const bldrJSON = await this.localFile._getBldrJSON(dirPath, this.contextMap);
    const argvArr = argv._;
    argvArr.shift();

    const files = argvArr.map((file) => {
      let filepath = file

      // Get current folder name when in current working directory
      if (!file.includes('/'))
        filepath = `${process.cwd().split('/').slice(-1).pop()}/${file}`

      return filepath
    })

    const instance = await this._stateInstance()
    await this._addFilesToTemp(files, dirPath, bldrJSON, instance)
  }



  _addFilesToTemp(files, dirPath, bldrJSON, instance) {
    const tempPush = files.map((filePath) => {
      const bldrObj = bldrJSON.filter((bldr) => {
        return bldr.folderPath.includes(filePath)
      })

      if (bldrObj)
        return this.stash._setStashObj(dirPath, bldrObj)
    })

    this.stash._saveStash(instance, tempPush)
  }



  _addAllToTemp(files, dirPath, bldrJSON, instance) {
    const tempPush = files.map((file) => {
      const fullPath = file.fullpath;
      const bldrObj = bldrJSON.filter((bldr) => {
        return fullPath.includes(bldr.folderPath)
      })

      if (bldrObj)
        return this.stash._setStashObj(dirPath, bldrObj)
    })

    this.stash._saveStash(instance, tempPush)
  }


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }
}
