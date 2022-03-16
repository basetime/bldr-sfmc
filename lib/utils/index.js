const fs = require('fs');
const fsPromises = require("fs").promises;
var isEqual = require('lodash.isequal');

module.exports.assignObject = (obj) => Object.assign({}, obj)
module.exports.getParentFolderFromArray = (folders, parentId) => folders.filter(folder => folder.id === parentId)


module.exports.createDir = async (dir) => {
  try {
    await fsPromises.access(dir, fs.constants.F_OK);
  } catch (e) {
    await fsPromises.mkdir(dir, { recursive: true });
  }
}


module.exports.localFileExists = (filepath) => {
  try {
    return fs.existsSync(filepath);
  } catch (err) {
    console.error(err)
  }
}


module.exports.localAppendFile = (filepath, content) => {
  fs.readFile(filepath, function (err, fileData) {
    if (err) throw err;
    if (!fileData.includes(content)) {
      fs.appendFile(filepath, content, function (err) {
        if (err) throw err;
      });
    }
  });
}



module.exports.localCreateFile = async (filePath, content) => {
  const dirPathArr = filePath.split('/')
  dirPathArr.pop();
  const dirPath = dirPathArr.join('/')

  fs.writeFile(filePath, content, 'utf8', async (err) => {
    if (err) {
      console.log(dirPath)
      await this.createDir(dirPath)
      await this.localCreateFile(filePath, content)
    }
  });
}


module.exports.gitIgnore = () => {
  if (this.localFileExists(`./.gitignore`)) {
    this.localAppendFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
  } else {
    this.localCreateFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
  }
}




module.exports.manifestJSON = (context, content) => {
  if (typeof content !== 'object')
    throw new Error('Content needs to be an object')

  if (!context)
    throw new Error('Context is required')

  if (this.localFileExists('./.local.manifest.json')) {
    const manifest = fs.readFileSync('./.local.manifest.json');
    let manifestJSON = JSON.parse(manifest);

    for (const c in content) {
      if (
        manifestJSON.hasOwnProperty(context) &&
        manifestJSON[context].hasOwnProperty(c)
      ) {
        const ctx = manifestJSON[context];

        content[c].map((item) => {
          if (item.hasOwnProperty('id')) {
            const manifestObj = ctx[c].find(({ id }) => id === item.id)

            if (typeof manifestObj === 'undefined') {
              ctx[c] = [...ctx[c], item]
            } else {
              if (!isEqual(item, manifestObj)) {
                const updateIndex = ctx[c].findIndex(({ id }) => id === item.id)
                ctx[c][updateIndex] = item
              }
            }
          }
        })


      } else {
        if (!manifestJSON[context])
          manifestJSON[context] = {};

        manifestJSON[context][c] = [...content[c]]
      }
    }

    fs.writeFileSync('./.local.manifest.json', JSON.stringify(manifestJSON, null, 2))
  } else {
    const init = {}

    fs.writeFileSync('./.local.manifest.json', JSON.stringify(init, null, 2))
    this.manifestJSON(context, content)
  }
}