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
    await this._saveStash(instance, [])
    await this.status()
  }

  async remove(argv){
    console.log(argv)
  }


  _saveStash(instance, tempPush) {
    const instanceStash = this.store.stash.get(instance);
    const stashArr = instanceStash && instanceStash.stash;
    if (stashArr && Array.isArray(stashArr)) {
      if(tempPush.length !== 0) {
        const stashUpdate = tempPush.map((item) => {
          if (!stashArr.find((stashEntry) => stashEntry.bldrId === item.bldrId))
            return item
        })

        this.store.stash.set({ [instance]: { stash: [...stashArr, ...stashUpdate.filter(Boolean)] } })
      } else {
        this.store.stash.set({ [instance]: { stash: [] } })
      }
    } else {
      this.store.stash.set({ [instance]: { stash: tempPush } })
    }
  }


  async _getStashArr() {
    const instance = await this._stateInstance();
    const stash = this.store.stash.get(instance);
    return stash ? stash.stash : null;
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


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }
}
