const fs = require('fs')
const path = require('path')
const process = require('process')
const find = require('lodash.find');
const getFiles = require("node-recursive-directory")
const Conf = require("conf");

const Column = require("../help/Column");
const utils = require("../utils");
const contextMap = require("../contextMap");
const display = require('../displayStyles')
const { styles, width } = display.init();

const add = new Conf({
  configName: 'stash'
})

const stateConfiguration = new Conf({
  configName: `sfmc__stateManagement`,
})

module.exports = class Add {
  async addAll() {
    const dirPath = await this._getRootPath(contextMap);
    const bldrJSON = await this._getBldrJSON(dirPath, contextMap);
    const files = await getFiles(process.cwd(), true); // add true
    const instance = await this._stateInstance()
    await this._addAllToTemp(files, dirPath, bldrJSON, instance)
  }

  async addFiles(argv) {
    const dirPath = await this._getRootPath(contextMap);
    const bldrJSON = await this._getBldrJSON(dirPath, contextMap);
    const argvArr = argv._;
    argvArr.shift();

    const files = argvArr.map((file) => {
      let filepath = file

      // Get current folder name when in current working directory
      if(!file.includes('/'))
        filepath = `${process.cwd().split('/').slice(-1).pop()}/${file}`

        return filepath
    })

  const instance = await this._stateInstance()
   await this._addFilesToTemp(files, dirPath, bldrJSON, instance)
  }



  async status(){
    const contextMap = require("../contextMap")
    const stash = add.get('stash')
  
    const headers = [
      new Column(`Staged Files`, width.c4)
    ]

    const displayContent = stash.map(({folderPath}) => {
      return [
        new Column(`${folderPath}`, width.c4)
      ]
    })

    display.render(headers, displayContent)
  }


  _addFilesToTemp(files, dirPath, bldrJSON, instance){
    const tempPush = files.map((filePath) => {
      const bldrObj = bldrJSON.filter((bldr) => {
        return bldr.folderPath.includes(filePath)
      })

      if (bldrObj) {
        const file = fs.readFileSync(`${dirPath}${bldrObj[0].folderPath}`)
        const fileType = bldrObj[0].folderPath.includes('.html') ? 'html' : 'json';
        const fileContent = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);
        return {
          bldrId: bldrObj[0].bldrId,
          folderPath: bldrObj[0].folderPath,
          fileContent
        }
      }
    })


    const stash = add.get('stash');
    if (stash && Array.isArray(stash)) {
      const stashUpdate = tempPush.map((item) => {
        if(!stash.find((stashEntry) => stashEntry.bldrId === item.bldrId))
          return item
      })

      add.set({ [instance]: {stash: [...stash, ...stashUpdate.filter(Boolean)] }})
    } else {
      add.set({ [instance]: { stash: tempPush }})
    }
  }


  _addAllToTemp(files, dirPath, bldrJSON, instance) {
    const tempPush = files.map((file) => {
      const fullPath = file.fullpath;
      const bldrObj = bldrJSON.filter((bldr) => {
        return fullPath.includes(bldr.folderPath)
      })

      if (bldrObj) {
        const file = fs.readFileSync(`${dirPath}${bldrObj[0].folderPath}`)
        const fileType = bldrObj[0].folderPath.includes('.html') ? 'html' : 'json';
        const fileContent = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);
        return {
          bldrId: bldrObj[0].bldrId,
          folderPath: bldrObj[0].folderPath,
          fileContent
        }
      }
    })

    const stash = add.get('stash');

    if (stash && Array.isArray(stash)) {
      const stashUpdate = tempPush.map((item) => {
        if(!stash.find((stashEntry) => stashEntry.bldrId === item.bldrId))
          return item
      })

      add.set({ [instance]: {stash: [...stash, ...stashUpdate.filter(Boolean)] }})
    } else {
      add.set({ [instance]: { stash: tempPush }})
    }
  }

  _getRootPath(contextMap) {
    const rootArr = contextMap.map(({ root }) => {
      const dirPath = path.resolve('./')
      if (dirPath.includes(root))
        return dirPath.split(root)[0]

      return null
    })

    if (rootArr.filter(Boolean)[0])
      return rootArr.filter(Boolean)[0]
  }


  _getBldrJSON(dirPath, contextMap){
    const bldrRef = fs.readFileSync(`${dirPath}.bldr`);
    return JSON.parse(bldrRef);
  }


  _searchObject(array, key, value) {
    var o;
    array.some(function iter(a) {
      if (a[key] === value) {
        o = a;
        return true;
      }
      return Array.isArray(a.children) && a.children.some(iter);
    });
    return o;
  }

  _stateInstance(){
    const state = stateConfiguration.get();
    const stateJSON = utils.assignObject(state)
    console.log(stateJSON)
    return stateJSON.instance;
  }
}
