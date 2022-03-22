const bldr = require('./index')


const getFolders = async () => {
  const resp = await bldr.folder.getFoldersRecursiveDESC(69858)
  
  console.log(resp)
}

getFolders()