const fs = require('fs')
const path = require('path')
const process = require('process')
const getFiles = require("node-recursive-directory")
const Column = require("../help/Column");
const utils = require("../utils");
const display = require('../displayStyles')
const { styles, width } = display.init();


module.exports = class Add {
  constructor(localFile, contextMap, store) {
    this.localFile = localFile;
    this.contextMap = contextMap;
    this.store = store;
  }

  async addAll() {
    const dirPath = await this.localFile._getRootPath(this.contextMap);
    const bldrJSON = await this.localFile._getBldrJSON(dirPath, this.contextMap);
    const files = await getFiles(process.cwd(), true); // add true
    const instance = await this._stateInstance()
    await this._addAllToTemp(files, dirPath, bldrJSON, instance)
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



  async status() {
    const instance = await this._stateInstance();
    const stash = this.store.stash.get(instance);
    const stashArr = stash.stash;

    const headers = [
      new Column(`Staged Files`, width.c4)
    ]

    const displayContent = stashArr.map(({ folderPath }) => {
      return [
        new Column(`${folderPath}`, width.c4)
      ]
    })

    display.render(headers, displayContent)
  }


  _addFilesToTemp(files, dirPath, bldrJSON, instance) {
    const tempPush = files.map((filePath) => {
      const bldrObj = bldrJSON.filter((bldr) => {
        return bldr.folderPath.includes(filePath)
      })

      if (bldrObj)
        return this._setStashObj(dirPath, bldrObj)
    })

    this._saveStash(instance, tempPush)
  }


  
  _addAllToTemp(files, dirPath, bldrJSON, instance) {
    const tempPush = files.map((file) => {
      const fullPath = file.fullpath;
      const bldrObj = bldrJSON.filter((bldr) => {
        return fullPath.includes(bldr.folderPath)
      })

      if (bldrObj)
        return this._setStashObj(dirPath, bldrObj)
    })

   this._saveStash(instance, tempPush)
  }


  _setStashObj(dirPath, bldrObj) {
    const file = fs.readFileSync(`${dirPath}${bldrObj[0].folderPath}`)
    const fileType = bldrObj[0].folderPath.includes('.html') ? 'html' : 'json';
    const fileContent = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);
    return {
      bldrId: bldrObj[0].bldrId,
      folderPath: bldrObj[0].folderPath,
      fileContent
    }
  }

  _saveStash(instance, tempPush) {
    const instanceStash = this.store.stash.get(instance);
    const stashArr = instanceStash && instanceStash.stash;
    if (stashArr && Array.isArray(stashArr)) {
      const stashUpdate = tempPush.map((item) => {
        if (!stashArr.find((stashEntry) => stashEntry.bldrId === item.bldrId))
          return item
      })

      this.store.stash.set({ [instance]: { stash: [...stashArr, ...stashUpdate.filter(Boolean)] } })
    } else {
      this.store.stash.set({ [instance]: { stash: tempPush } })
    }
  }


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }
}
