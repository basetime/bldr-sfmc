const fs = require('fs');

const cliFormat = require('cli-format')
const auth = require("../../../../lib/utils/sfmc/auth");
const state = require("../../../state/switch");

const Column = require("../../../utils/help/Column")
const displayStyle = require('../../../../lib/utils/displayStyles')
const { localCreateDir, localFileExists, localAppendFile, localCreateFile, getParentFolderFromArray } = require('../../../../lib/utils/index')
const { cloneFolders } = require('./folderUtils')
const { cloneAssets } = require('./assetUtils')
const { styles, width } = displayStyle.init();



module.exports.cloneFromFolder = async (argv) => {
  try {
    const sfmc = await auth.setAuth();
    const folderPaths = await cloneFolders(argv, sfmc)
    const contentData = await cloneAssets(folderPaths, sfmc)
    
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

      localCreateFile(`./.local.manifest.json`, `${JSON.stringify(localManifestInit, null, 2)}`)
    } else {

      const manifest = fs.readFileSync(`./.local.manifest.json`);
      let manifestJSON = JSON.parse(manifest);
      manifestJSON.contentBuilder.folders = folderPaths
      manifestJSON.contentBuilder.content = contentData

      localCreateFile(`./.local.manifest.json`, `${JSON.stringify(manifestJSON, null, 2)}`)
    }
  } catch (err) {
    console.log(err)
  }
}

