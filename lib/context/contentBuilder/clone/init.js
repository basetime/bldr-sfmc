const fs = require('fs');

const cliFormat = require('cli-format')
const auth = require("../../../../lib/utils/sfmc/auth");
const state = require("../../../state/switch");

const Column = require("../../../utils/help/Column")
const displayStyle = require('../../../../lib/utils/displayStyles')
const { createDir, fileExists, appendFile, createFile } = require('../../../../lib/utils/index')
const { styles, width } = displayStyle.init();


const getParentFolder = async (folders, parentId) => folders.filter(folder => folder.id === parentId)

const getFolders = async (id, client) => {
  let parentId = id;
  const search = await client.rest.get(
    `/asset/v1/content/categories?$pagesize=20&$filter=parentId%20eq%20${id}`
  );

  return search.items ? search.items : null;
};


const getFoldersRecursive = async (rootID, client) => {
  try {
    let folders = [rootID];
    const foldersOut = [];

    do {
      folderId = folders[0];
      let subFolderResp = await getFolders(folderId, client);

      if (subFolderResp) {
        let subfolderIdArray = subFolderResp.map((folder) => folder.id);
        folders.push(...subfolderIdArray);
        foldersOut.push(...subFolderResp);
      }

      folders.shift();
    } while (folders.length !== 0);


    return foldersOut;
  } catch (err) {
    console.log(err);
  }
};


const setFolderPaths = async (foldersArray) => {
  const foldersOut = [];
  let path = '';
  let parentId;
  let hasParent;

  for (const f in foldersArray) {
    let folderObj = foldersArray[f];
    let parentFolder;

    if (folderObj.rootFolder === true) {

      path += `Content Builder/${folderObj.name}`;

    } else {
      parentId = folderObj.parentId
      hasParent = true;

      let establishedPath = foldersOut.find(({ id }) => id === parentId)
    
      if (establishedPath) {
        path = `${establishedPath.folderPath}/${folderObj.name}`
      } else {

        do {
          let parentFolder = await getParentFolder(foldersArray, parentId)
          path += `/${parentFolder[0].name}`
          hasParent = parentFolder.length !== 0 ? true : false;
        } while (!hasParent)

        path += `/${folderObj.name}`
      }
      
    }

    folderObj.folderPath = `${path}`;
    foldersOut.push(folderObj)

    path = '';
  }

  return foldersOut
}


const gitignore = (content) => {
  if(fileExists(`./.gitignore`)){
    appendFile(`./.gitignore`, content)
  } else {
    createFile(`./.gitignore`, content)
  }
}


module.exports.cloneFolders = async (argv) => {
  const sfmc = await auth.setAuth();

  const rootCategory = await sfmc.soap.retrieve(
    "DataFolder",
    [
      "Name",
      "ID",
      "ObjectID",
      "ParentFolder.ID",
      "ParentFolder.Name",
      "Description",
    ],
    {
      filter: {
        leftOperand: "ID",
        operator: "equals",
        rightOperand: argv.f,
      },
    }
  );

  let root =
    rootCategory.Results && rootCategory.Results[0]
      ? rootCategory.Results[0]
      : null;

  if (root) {
    const rootID = root ? root.ID : null;
    const rootObj = [{
      id: root.ID,
      description: root.Description,
      name: root.Name,
      parentId: root.ParentFolder.ID,
      rootFolder: true
    }]
  

    const foldersArray = [...rootObj, ...await getFoldersRecursive(rootID, sfmc)];
    const folderPaths = await setFolderPaths(foldersArray)

    folderPaths.map(({folderPath}) => !fileExists(folderPath) ? createDir(folderPath) : null)

    
    
    gitignore(`\n# bldr Local Manifest\n .local.manifest.json\n`)

    

    if(!fileExists(`./.local.manifest.json`)){
      const localManifestInit = {
        contentBuilder: {
          folders: folderPaths
        }
      }

      createFile(`./.local.manifest.json`, `${JSON.stringify(localManifestInit, null, 2)}`)
    } else {

      let manifest = fs.readFileSync(`./.local.manifest.json`);
      let manifestJSON = JSON.parse(manifest);
          manifestJSON.contentBuilder.folders = folderPaths

      createFile(`./.local.manifest.json`, `${JSON.stringify(manifestJSON, null, 2)}`)
    }
  }
};
