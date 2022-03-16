const fs = require('fs');

const cliFormat = require('cli-format')
const auth = require("../../../../lib/utils/sfmc/auth");
const state = require("../../../state/switch");

const Column = require("../../../utils/help/Column")
const displayStyle = require('../../../../lib/utils/displayStyles')
const { localFileExists, localAppendFile, localCreateFile, getParentFolderFromArray, gitIgnore, manifestJSON } = require('../../../../lib/utils/index')
const { cloneFoldersDESC, cloneFoldersASC } = require('./folderUtils')
const { cloneAssetsFromFolder, cloneAssetFromId, createEditableFiles } = require('./assetUtils')
const { styles, width } = displayStyle.init();


module.exports.cloneFromFolder = async (argv, client) => {
  try {

    const folderPaths = await cloneFoldersDESC(argv, client)
    const contentData = await cloneAssetsFromFolder(folderPaths, client)

    await gitIgnore();
    await manifestJSON('contentBuilder', {folders: folderPaths})
    await manifestJSON('contentBuilder', {contentBlocks: contentData})

  } catch (err) {
    console.log(err)
  }
}



module.exports.cloneFromID = async (argv, client) => {
  try {
    if (!argv.a)
      throw new Error('Asset ID is required')

    const contentData = await cloneAssetFromId(argv.a, client)

    await gitIgnore();
    await manifestJSON('contentBuilder', {folders: contentData.folders})
    await manifestJSON('contentBuilder', {contentBlocks: contentData.assets})
    
  } catch (err) {
    console.log(err)
  }
}