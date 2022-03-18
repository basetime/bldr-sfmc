const bldr = require('./index')


const getFolders = async () => {
  const resp = await bldr.folder.get()
  console.log('getfolder', resp)
}

const folder = getFolders()
console.log(folder)