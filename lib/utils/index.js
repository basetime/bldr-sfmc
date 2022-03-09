const fs = require('fs');

module.exports.assignObject = (obj) => Object.assign({}, obj)

module.exports.createDir = (dirName) => {
  try {
    //Create folder directory
    fs.mkdir(`./${dirName}`, { recursive: true }, function (err) {
      if (err) {
        console.log(err)
      } else {
        console.log(`${dirName} Created`)
      }
    })
  } catch (e) {
    ;
  }
}

module.exports.fileExists = (filepath) => {
  try {
   return fs.existsSync(filepath);
  } catch(err) {
    console.error(err)
  }
}


module.exports.appendFile = (filepath, content) => {
  fs.readFile(filepath, function (err, fileData) {
    if (err) throw err;
    if(!fileData.includes(content)){
      fs.appendFile(filepath, content, function (err) {
        if (err) throw err;
      });
    }
  });
}

module.exports.createFile = (filepath, content) => {
  fs.writeFile(filepath, content, 'utf8', (err) => {
      if (err) throw err;
  });
}