const fs = require('fs');


module.exports.assignObject = (obj) => Object.assign({}, obj)
module.exports.getParentFolderFromArray = (folders, parentId) => folders.filter(folder => folder.id === parentId)

module.exports.localCreateDir = (dirName) => {
  try {
    //Create folder directory
    fs.mkdir(`./${dirName}`, { recursive: true }, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log(`${dirName} Created`)
      }
    })
  } catch (err) {
    console.log(err);
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

module.exports.localCreateFile = (filepath, content) => {
  fs.writeFile(filepath, content, 'utf8', (err) => {
    if (err) console.trace(err);

  });
}