const fs = require('fs');

const cliFormat = require('cli-format')
const auth = require("../../../../lib/utils/sfmc/auth");
const state = require("../../../state/switch");

const Column = require("../../../utils/help/Column")
const displayStyle = require('../../../../lib/utils/displayStyles')
const { localCreateDir, localFileExists, localAppendFile, localCreateFile, getParentFolderFromArray } = require('../../../../lib/utils/index')
const { cloneFoldersDESC, cloneFoldersASC } = require('./folderUtils')
const { cloneAssetsFromFolder, cloneAssetFromId, createEditableFiles } = require('./assetUtils')
const { styles, width } = displayStyle.init();



module.exports.cloneFromFolder = async (argv, client) => {
  try {

    const folderPaths = await cloneFoldersDESC(argv, client)
    const contentData = await cloneAssetsFromFolder(folderPaths, client)

    if (localFileExists(`./.gitignore`)) {
      localAppendFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
    } else {
      localCreateFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
    }

    if (!localFileExists(`./.local.manifest.json`)) {
      const localManifestInit = {
        contentBuilder: {
          folders: folderPaths,
          content: contentData
        }
      }

      await localCreateFile(`./.local.manifest.json`, `${JSON.stringify(localManifestInit, null, 2)}`)
    } else {

      const manifest = fs.readFileSync(`./.local.manifest.json`);
      let manifestJSON = JSON.parse(manifest);
      manifestJSON.contentBuilder.folders = new Set([[...folderPaths, ...manifestJSON.contentBuilder.folders]])
      manifestJSON.contentBuilder.content = new Set([[...contentData, ...manifestJSON.contentBuilder.content]])
      //await localCreateFile(`./.local.manifest.json`, `${JSON.stringify(manifestJSON, null, 2)}`)
    }
  } catch (err) {
    console.log(err)
  }
}



module.exports.cloneFromID = async (argv, client) => {
  try {
  if (!argv.a)
    throw new Error('Asset ID is required')

  const contentData = await cloneAssetFromId(argv.a, client)
  await createEditableFiles(contentData.assets)

  if (localFileExists(`./.gitignore`)) {
    localAppendFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
  } else {
    localCreateFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
  }

  if (!localFileExists(`./.local.manifest.json`)) {
    const localManifestInit = {
      contentBuilder: {
        folders: contentData.folders,
        content: contentData.assets
      }
    }

    await localCreateFile(`./.local.manifest.json`, `${JSON.stringify(localManifestInit, null, 2)}`)
  } else {

    const manifest = fs.readFileSync(`./.local.manifest.json`);
    let manifestJSON = JSON.parse(manifest);
    manifestJSON.contentBuilder.folders = new Set([[...contentData.folders, ...manifestJSON.contentBuilder.folders]])
    manifestJSON.contentBuilder.content = new Set([[...contentData.assets, ...manifestJSON.contentBuilder.content]])

   // await localCreateFile(`./.local.manifest.json`, `${JSON.stringify(manifestJSON, null, 2)}`)
  }
} catch (err) {
  console.log(err)
}
}