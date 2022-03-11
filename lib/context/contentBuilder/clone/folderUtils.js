
const { localCreateDir, getParentFolderFromArray, localFileExists } = require('../../../utils/index')



const getFolder = async (id, client) => {
  try {
    const search = await client.rest.get(
      `/asset/v1/content/categories/${id}`
    );

    const searchReturn = {
      id: search.id,
      name: search.name,
      parentId: search.parentId,
      categoryType: search.categoryType,
      rootFolder: id === search.id ? true : false
    }

    return search ? searchReturn : null;
  } catch (err) {
    console.log(err)
  }
}


const getSubfolders = async (id, client) => {
  try {
    let parentId = id;
    const search = await client.rest.get(
      `/asset/v1/content/categories?$filter=parentId%20eq%20${id}`
    );

    return search.items ? search.items : null;
  } catch (err) {
    console.log(err)
  }
}




const setFolderPaths = async (foldersArray, client) => {
  const foldersOut = [];
  let path = '';
  let parentId;
  let hasParent;

  for (const f in foldersArray) {
    let folderObj = foldersArray[f];
    let parentFolder;

    if (folderObj.rootFolder === true) {
      const parentObj = await getFolder(folderObj.parentId, client)
      path += `${parentObj.name}/${folderObj.name}`;

    } else {
      parentId = folderObj.parentId
      hasParent = true;

      let establishedPath = foldersOut.find(({ id }) => id === parentId)

      if (establishedPath) {
        path = `${establishedPath.folderPath}/${folderObj.name}`
      } else {

        do {
          let parentFolder = await getParentFolderFromArray(foldersArray, parentId)
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



const getFoldersRecursive = async (rootID, client) => {
  try {
    
    let folders = [rootID];
    const foldersOut = [];

    do {
      folderId = folders[0];
      let subFolderResp = await getSubfolders(folderId, client);

      if (subFolderResp) {
        let subfolderIdArray = subFolderResp.map((folder) => folder.id);
        folders.push(...subfolderIdArray);
        foldersOut.push(...subFolderResp);
      }

      folders.shift();
    } while (folders.length !== 0);


    return foldersOut.map((folder) => {
      return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        categoryType: folder.categoryType
      }
    });
  } catch (err) {
    console.log(err);
  }
};





const compileSFMCFolders = async (id, client) => {
  try {
    // Get root folder from SFMC based on user input
    const rootFolder = await getFolder(id, client)
    if (!rootFolder || !rootFolder.id)
      throw new Error(`Unable to find Folder: ${id ? id : ''}`)


      console.log('RootID', rootFolder.id)
    // Get all subfolders from SFMC based on initial folder Id
    const subFolders = await getFoldersRecursive(rootFolder.id, client)

    // Concatenate all folder Arrays into single Array
    const foldersArray = [rootFolder, ...subFolders];
    // Concatenate and add full folder paths to each folder boject
    const SFMCFolders = await setFolderPaths(foldersArray, client)

    return SFMCFolders

  } catch (err) {
    console.log(err)
  }
}


const createLocalDirs = (folderPaths) => folderPaths.map(({ folderPath }) => !localFileExists(folderPath) ? localCreateDir(folderPath) : null)


module.exports.cloneFolders = async (argv, client) => {
  try {
    console.log('getting sfmc folders');
    const folderPaths = await compileSFMCFolders(argv.f, client);
    console.log('cloning local folders');
    await createLocalDirs(folderPaths);

    return folderPaths
  } catch (err) {
    console.log(err)
  }
}