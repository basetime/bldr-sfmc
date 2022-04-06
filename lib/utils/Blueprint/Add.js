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
    const instance = await this._stateInstance();

    const dirPath = await this.localFile._getRootPath(this.contextMap);
    const contextsArr = this.contextMap.map((ctx) => this.localFile._fileExists(`./${ctx.root}`) && ctx.root)
    const contexts = contextsArr.filter(Boolean)
    const cwdPath = process.cwd();
    let ctxFiles = new Array();

    console.log({
      dirPath,
      cwdPath
    })

    // if dir is root folder
    if (dirPath === './') {
      // iterate all contexts and add files
      for(const c in contexts){
        ctxFiles.push(...await getFiles(`./${contexts[c]}`))
      }

    } else {
      // get files from current working directory
      ctxFiles.push(...await getFiles(`${cwdPath}`))
    }

    const newFiles = await this._gatherAllFiles(ctxFiles, dirPath, instance)
    await this._setNewAssets(newFiles.postFileOptions, newFiles.postFiles, instance)
  }



  async addFiles(argv) {
    const instance = await this._stateInstance();

    const dirPath = await this.localFile._getRootPath(this.contextMap);
    const contextsArr = this.contextMap.map((ctx) => this.localFile._fileExists(`./${ctx.root}`) && ctx.root)
    const contexts = contextsArr.filter(Boolean)
    const cwd = process.cwd();
    const projectFiles = await getFiles('./')
    const argvArr = argv._;
    argvArr.shift();
    
    let ctxFiles = new Array();

    for(const a in argvArr){
      // const path = `${cwd}/${argvArr[a]}`
      ctxFiles.push(`${cwd}/${argvArr[a]}`)
    }

    const newFiles = await this._gatherAllFiles(ctxFiles, dirPath, instance)
    await this._setNewAssets(newFiles.postFileOptions, newFiles.postFiles, instance)

  }



  _gatherAllFiles(ctxFiles, dirPath, instance) {
    const bldrJSON = this.localFile._getBldrJSON(dirPath)

    const postFiles = new Array();

    let postFileOptions = {
      interactive: { default: true }
    };

    let stashObj;
    let bldrObj;

    const existingAssets = ctxFiles.map(async (ctxFile) => {
      const bldrFilter = bldrJSON.filter((bldr) => {
        return ctxFile.includes(bldr.folderPath) ? true : false;
      })
      const checkBldr = bldrFilter.length === 0 ? false : true;

      if (checkBldr) {
        bldrObj = {
          path: ctxFile,
          bldr: bldrFilter[0]
        }

        stashObj = await this.stash._setStashObj(ctxFile, bldrObj, false)
      } else {
        const bldrId = utils.guid()
        const ctx = utils.ctx(ctxFile)
        const folderPath = ctxFile.substring(ctxFile.indexOf(ctx.root))

        bldrObj = {
          path: ctxFile,
          create: true,
          bldr: {
            context: ctx.context,
            bldrId,
            folderPath
          }
        }

        postFiles.push(bldrObj);
        postFileOptions[bldrId] = {
          type: 'list',
          describe: `What type of asset is ${folderPath}`,
          choices: ['htmlemail', 'codesnippetblock', 'htmlblock'],
          prompt: 'always',
        };

      }
    })

    return {
      postFileOptions,
      postFiles
    }
  }



  async checkStashArr(file) {
    try {
      const stashArr = await this.stash._getStashArr();

      if (stashArr.length !== 0) {
        return stashArr.filter((stashItem) => {
          return file === stashItem.path;
        })
      } else {
        return []
      }
    } catch (err) {
      console.log(err)
    }
  }



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

          const fullPathArr = filePath.split('/')
          const sliceIndex = fullPathArr.indexOf('Content Builder')
          const pathSlice = fullPathArr.slice(sliceIndex)
          const finalPath = pathSlice.join('/')

          const cwd = process.cwd();
          const ctx = await utils.ctx(cwd);
          let dir = ctx && cwd.substring(cwd.indexOf(ctx.root)) || '';
          let projectDir = dir === '' ? filePath : `${dir}/${filePath}`

          console.log(`stitched: ${dirPath}${projectDir}`)

          const bldrId = utils.guid();

          const newBldrObj = {
            bldrId,
            folderPath: projectDir,
            category: {}
          }

          const newAsset = await this._setNewAsset(newBldrObj, projectDir)
          const stashAdd = await this.stash._setStashObj(dirPath, newAsset, true)
        }

      }
    })
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




  _setNewAssets(postFileOptions, postFiles, instance) {

    return yargsInteractive()
      .usage("$0 <command> [args]")
      .interactive(postFileOptions)
      .then(async (optionsResult) => {
        // console.log(optionsResult)

        for (const o in optionsResult) {
          const postFile = postFiles.find(post => post.bldr.bldrId === o)

          if (typeof postFile !== 'undefined') {
            let postObj;
            let bldrObj = postFile.bldr;

            const assetType = optionsResult[o];
            const bldrId = bldrObj.bldrId;
            const folderPath = bldrObj.folderPath;
            const categoryDetails = await utils.filePathDetails(postFile.path)
            const fileName = categoryDetails.fileName;
            const folderName = categoryDetails.folderName;
            const assetName = fileName.substring(0, fileName.indexOf('.'))

            const file = fs.readFileSync(postFile.path)
            const fileType = postFile.path.includes('.html') ? 'html' : 'json';
            const content = fileType === 'html' ? `${file.toString()}` : JSON.parse(file);
            const manifestFolder = await this.stash._getManifestFolderData(postFile)

            console.log(manifestFolder.id)

            const asset = {
              bldrId,
              assetName,
              content,
              category: {
                id: manifestFolder.id,
                parentId: manifestFolder.parentId,
                folderName,
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

            postFile['post'] = postObj;
            await this.stash._saveStash(instance, postFile)
            
          }
        }
        
      })
  }

}
