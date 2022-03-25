const fs = require('fs');
const path = require('path')
const fsPromises = require("fs").promises;
const isEqual = require('lodash.isequal');
const unique = require('lodash.uniq')
const utils = require('../utils')
const Conf = require("conf");
const stateConfiguration = new Conf({
  configName: `sfmc__stateManagement`,
})


module.exports = class LocalFile {
  constructor(store, contextMap){
    this.store = store;
    this.contextMap = contextMap;
  }
  

  _getRootPath(contextMap) {
    const rootArr = contextMap.map(({ root }) => {
      const dirPath = path.resolve('./')
      if (dirPath.includes(root))
        return dirPath.split(root)[0]

      return null
    })

    if (rootArr.filter(Boolean)[0])
      return rootArr.filter(Boolean)[0]
  }


  _getBldrJSON(dirPath){
    const bldrRef = fs.readFileSync(`${dirPath}.bldr`);
    return JSON.parse(bldrRef);
  }

  
  async createEditableFiles(assets, context) {
    for (let a = 0; a < assets.length; a++) {
      const asset = assets[a];
      const assetType = asset.assetType.name;
      const folderPath = asset.category.folderPath;
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


      await this.appendBLDR({
        id: asset.id,
        context,
        bldrId: asset.bldrId,
        folderPath: dirPath
      })

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


  appendFile(filePath, content) {
    fs.readFile(filePath, function (err, fileData) {
      if (err) throw err;
      if (!fileData.includes(content)) {
        fs.appendFile(filePath, content, function (err) {
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



  append(filePath, content) {
    if (this._fileExists(filePath)) {
      this.appendFile(filePath, content)
    } else {
      this.createFile(filePath, content)
    }
  }



  appendBLDR(obj) {
    if (this._fileExists('./.bldr')) {
      const bldrJSON = this._parseJSON(`./.bldr`)
      const exists = bldrJSON.findIndex(({ id }) => id === obj.id) !== -1 ? true : false;

      if (!exists)
        bldrJSON.push(obj)

      fs.writeFileSync('./.bldr', JSON.stringify(bldrJSON, null, 2))
    } else {
      const init = []
      fs.writeFileSync('./.bldr', JSON.stringify(init, null, 2))
      this.appendBLDR(obj)
    }
  }


  manifestJSON(dirPath, context, content) {
    if (typeof content !== 'object')
      throw new Error('Content needs to be an object')

    if (!context)
      throw new Error('Context is required')

     const manifestPath = dirPath ? `${dirPath}.local.manifest.json` : `./.local.manifest.json`;

    if (this._fileExists(manifestPath)) {
      const manifest = fs.readFileSync(manifestPath);
      let manifestJSON = JSON.parse(manifest);

      if(context === 'instanceDetails' && !manifestJSON.hasOwnProperty(context)){
        manifestJSON[context] = content;
        fs.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2))
       
        return
      }

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

      fs.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2))
    } else {
      const init = {}
      const state = utils.assignObject(stateConfiguration.get())
      init.instanceDetails = state;
      
      fs.writeFileSync(manifestPath, JSON.stringify(init, null, 2))
      this.manifestJSON(context, content)
    }
  }


  _parseJSON(filePath) {
    if (this._fileExists(filePath)) {
      const rawContent = fs.readFileSync(filePath);
      return JSON.parse(rawContent);
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