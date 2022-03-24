const Conf = require("conf");
const fs = require('fs')
const path = require('path')
const process = require('process')
const getFiles = require("node-recursive-directory")
const find = require('lodash.find');
const utils = require("../utils");

const contextMap = require("../contextMap")

const add = new Conf({
  configName: 'stash'
})

module.exports = class Add {
  async addAll() {
    const dirPath = await this._getRootPath(contextMap);
    const bldrJSON = await this._getBldrJSON(dirPath, contextMap);
    const files = await getFiles(process.cwd(), true); // add true
    await this._addAllToTemp(files, dirPath, bldrJSON)
  }



  async addFiles(argv) {
    const dirPath = await this._getRootPath(contextMap);
    const bldrJSON = await this._getBldrJSON(dirPath, contextMap);
    const argvArr = argv._;
    argvArr.shift();

    const files = argvArr.map((file) => {
      let filepath = file
      if(!file.includes('/'))
        filepath = `${process.cwd().split('/').slice(-1).pop()}/${file}`

        return filepath
    })

   await this._addFilesToTemp(files, dirPath, bldrJSON)
  }



  _addFilesToTemp(files, dirPath, bldrJSON){
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

      // console.log('stash', stash)

      add.set({ stash: [...stash, ...stashUpdate.filter(Boolean)] })
    } else {
      add.set({ stash: tempPush })
    }
  }


  _addAllToTemp(files, dirPath, bldrJSON) {
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

      add.set({ stash: [...stash, ...stashUpdate.filter(Boolean)] })
    } else {
      add.set({ stash: tempPush })
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
}
