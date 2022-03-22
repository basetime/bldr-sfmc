const fs = require('fs');
const fsPromises = require("fs").promises;
var isEqual = require('lodash.isequal');

module.exports = class LocalFile {

  async createEditableFiles(assets) {
    for (let a = 0; a < assets.length; a++) {
      const asset = assets[a];
      const assetType = asset.assetType.name;
      const folderPath = asset.category.path;
      const fileName = asset.name;

      let content;
      let ext;
      let dirPath;

      if (
        // html content
        asset.hasOwnProperty('views') &&
        asset.views.hasOwnProperty('html') &&
        asset.views.html.hasOwnProperty('content') &&
        !asset.views.html.hasOwnProperty('slots')
      ) {
        content = asset.views.html.content;
        ext = '.html';
        dirPath = `${folderPath}/${fileName}${ext}`;
      } else if (
        // non-slot content block
        asset.hasOwnProperty('content') &&
        !asset.hasOwnProperty('slots')
      ) {
        content = asset.content;
        ext = '.html';
        dirPath = `${folderPath}/${fileName}${ext}`;
      } else if (
        // slit content block
        asset.hasOwnProperty('content') &&
        asset.hasOwnProperty('slots')
      ) {
        content = JSON.stringify(asset, null, 2);
        ext = '.json';
        dirPath = `${folderPath}/${fileName}${ext}`;
      } else if (
        // template content
        asset.hasOwnProperty('views') &&
        asset.views.hasOwnProperty('html') &&
        asset.views.html.hasOwnProperty('content') &&
        asset.views.html.hasOwnProperty('slots')
      ) {
        content = JSON.stringify(asset, null, 2);
        ext = '.json';
        dirPath = `${folderPath}/${fileName}${ext}`;
      } else {
        // unable to identify
        content = JSON.stringify(asset, null, 2);
        ext = '.json';
        dirPath = `${folderPath}/${fileName}${ext}`;
      }

      await this.createFile(`${dirPath}`, content);
    }
  }




  async createFile(filePath, content) {
    const dirPathArr = filePath.split('/')
    dirPathArr.pop();
    const dirPath = dirPathArr.join('/')

    fs.writeFile(filePath, content, 'utf8', async (err) => {
      if (err) {
        console.log(dirPath)
        await this.createDir(dirPath)
        await this.createFile(filePath, content)
      }
    });
  }


  appendFile(filepath, content) {
    fs.readFile(filepath, function (err, fileData) {
      if (err) throw err;
      if (!fileData.includes(content)) {
        fs.appendFile(filepath, content, function (err) {
          if (err) throw err;
        });
      }
    });
  }



  async createDir(dir) {
    try {
      await fsPromises.access(dir, fs.constants.F_OK);
    } catch (e) {
      await fsPromises.mkdir(dir, { recursive: true });
    }
  }



  gitIgnore() {
    if (this._fileExists(`./.gitignore`)) {
      this.appendFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
    } else {
      this.createFile(`./.gitignore`, `\n# bldr Local Manifest\n .local.manifest.json\n`)
    }
  }



  manifestJSON(context, content) {
    if (typeof content !== 'object')
      throw new Error('Content needs to be an object')

    if (!context)
      throw new Error('Context is required')

    if (this._fileExists('./.local.manifest.json')) {
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


  _parseManifestJSON() {
    if (this._fileExists('./.local.manifest.json')) {
      const manifest = fs.readFileSync('./.local.manifest.json');
      let manifestJSON = JSON.parse(manifest);
    }
  }


  _fileExists(filepath) {
    try {
      return fs.existsSync(filepath);
    } catch (err) {
      console.error(err)
    }
  }


}