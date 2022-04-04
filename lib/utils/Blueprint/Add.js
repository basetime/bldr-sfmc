const yargsInteractive = require("yargs-interactive");
const coreConfigurationOptions = require("../options");
const assetDefinitions = require('../sfmc_api_definitions')
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
    this.stash = stash;
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

        if (!this.localFile._fileExists(addPath))
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

      console.log(filepath)

      return filepath
    })

    const instance = await this._stateInstance()
    await this._addFilesToTemp(files, dirPath, bldrJSON, instance)
  }



  // async _addFilesToTemp(files, dirPath, bldrJSON, instance) {
  //   const stashArr = await this.stash._getStashArr();

  //   const tempPush = files.map((fullPath) => {
  //     const bldrObj = stashArr.filter((stashItem) => {
  //        if(stashItem.folderPath.includes(fullPath))
  //         return stashItem
  //     })

  //     if (bldrObj.length !== 0){
  //       return this.stash._setStashObj(dirPath, bldrObj)
  //     } else {
  //       const fullPathArr = fullPath.split('/')
  //       const sliceIndex = fullPathArr.indexOf('Content Builder')
  //       const pathSlice = fullPathArr.slice(sliceIndex)
  //       const filePath = pathSlice.join('/')

  //       return this._setNewAsset(dirPath, filePath)
  //     }
  //   })

  //   console.log('tempPush', tempPush)
  //   this.stash._saveStash(instance, tempPush)
  // }


  _addFilesToTemp(files, dirPath, bldrJSON, instance) {
    let stashAdd;

    // check for object in bldrJSON
    const tempPush = files.map(async (filePath) => {
      const bldrObj = bldrJSON.filter((bldr) => {
        return bldr.folderPath.includes(filePath)
      })


      if (bldrObj.length !== 0) {
        stashAdd = await this.stash._setStashObj(dirPath, bldrObj)
        await this.stash._saveStash(instance, stashAdd)
      } else {
        const stashArr = await this.stash._getStashArr();
        let stashObj;

        if (stashArr) {
          stashObj = stashArr.map((stashItem) => {
            if (
              stashItem.hasOwnProperty('category') &&
              stashItem.category.hasOwnProperty('folderPath') &&
              stashItem.category.folderPath.includes(filePath)
            ) {
              return stashItem
            }
          })
        }

        if (Array.isArray(stashObj) && stashObj.length !== 0) {
          const newAsset = stashObj[0].hasOwnProperty('create') && stashObj[0].create ? true : false;

          stashAdd = await this.stash._setStashObj(dirPath, stashObj[0], newAsset)
          await this.stash._saveStash(instance, stashAdd)
        } else {
          const cwd = process.cwd('./');
          const file = filePath.split('/').slice(-1).pop();
          const fullPath = `${cwd}/${file}`
          const ctxObj = await this.localFile._getContextObj(this.contextMap)
          const folderPath = fullPath.substring(fullPath.indexOf(ctxObj.root))

          const newBldrObj = await this._prepNewFile(dirPath, folderPath)
          const newAsset = await this._setNewAsset(newBldrObj, dirPath)
          const stashAdd = await this.stash._setStashObj(dirPath, newAsset, true)
          await this.stash._saveStash(instance, stashAdd)
          console.log('newAsset', stashAdd)
        }

      }
    })
  }



  _addAllToTemp(files, dirPath, bldrJSON, instance) {
    let stashAdd;

    files.forEach(async (file) => {
      const fullPath = file.fullpath;

      const bldrObj = bldrJSON.filter((bldr) => {
        return fullPath.includes(bldr.folderPath)
      })

      if (bldrObj.length !== 0) {
        stashAdd = await this.stash._setStashObj(dirPath, bldrObj)
        await this.stash._saveStash(instance, stashAdd)
      } else {
       
        const ctxObj = await this.localFile._getContextObj(this.contextMap)
        const filePath = fullPath.substring(fullPath.indexOf(ctxObj.root))

        const newBldrObj = await this._prepNewFile(dirPath, filePath)
        const newAsset = await this._setNewAsset(newBldrObj, dirPath)
        const stashAdd = await this.stash._setStashObj(dirPath, newAsset, true)
        await this.stash._saveStash(instance, stashAdd)

      }

    })

    // console.log('tempPush', tempPush)

  }


  _stateInstance() {
    const state = this.store.state.get();
    const stateJSON = utils.assignObject(state)
    return stateJSON.instance;
  }


  _prepNewFile(dirPath, filePath) {
    const bldrId = utils.guid();
    const bldrObj = [{
      bldrId,
      folderPath: filePath
    }]

    return this.stash._setStashObj(dirPath, bldrObj)
  }




  _setNewAsset(newBldrObj, dirPath) {

    return yargsInteractive()
      .usage("$0 <command> [args]")
      .interactive(coreConfigurationOptions.createNewFile(newBldrObj.name))
      .then(async (assetResult) => {

        const assetType = assetResult.assetType;
        let postObj;

        const bldrId = newBldrObj.bldrId;
        const content = newBldrObj.fileContent;
        const folderPath = newBldrObj.folderPath;
        const categoryDetails = await utils.filePathDetails(folderPath)
        const fileName = categoryDetails.fileName;
        const folderName = categoryDetails.folderName;
        const assetName = fileName.substring(0, fileName.indexOf('.'))

        const asset = {
          bldrId,
          assetName,
          content,
          category: {
            folderName,
            // folderId,
            // parentId,
            folderPath
          }
        }

        switch (assetType) {
          case 'htmlemail':

            break;
          case 'codesnippetblock':

            postObj = await assetDefinitions.codesnippetblock(asset)
            break;
        }

        postObj.create = true;
        return postObj
      })
  }

}
