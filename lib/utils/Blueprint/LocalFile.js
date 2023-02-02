const fs = require('fs');
const fsPromises = require('fs').promises;
const isEqual = require('lodash.isequal');
const path = require('path');
const Conf = require('conf');

const display = require('../displayStyles');
const contextMap = require('../contextMap');
const utils = require('../utils');
const stateConfiguration = new Conf({
    configName: `sfmc__stateManagement`,
});

module.exports = class LocalFile {
    constructor(bldr, contextMap, store) {
        this.bldr = bldr;
        this.contextMap = contextMap;
        this.store = store;
    }

    _getContextObj(contextMap) {
        const rootArr = contextMap.map((ctx) => {
            const dirPath = path.resolve('./');
            if (dirPath.includes(ctx.root)) return ctx.context;

            return null;
        });

        if (rootArr.filter(Boolean)[0]) return rootArr.filter(Boolean)[0];

        return './';
    }

    _getRootPath(contextMap) {
        const rootArr = contextMap.map(({ root }) => {
            const dirPath = path.resolve('./');
            if (dirPath.includes(root)) return dirPath.split(root)[0];

            return null;
        });

        if (rootArr.filter(Boolean)[0]) return rootArr.filter(Boolean)[0];

        return './';
    }

    _getBldrJSON(dirPath) {
        const bldrRef = fs.readFileSync(`${dirPath}.bldr`);
        return JSON.parse(bldrRef);
    }

    _getSFMCConfig() {
        const dirPath = this._getRootPath(contextMap);

        if (this._fileExists(`${dirPath}.sfmc.config.json`)) {
            const config = fs.readFileSync(`${dirPath}.sfmc.config.json`);
            return JSON.parse(config);
        }
    }

    _getSFMCPackage() {
        const dirPath = this._getRootPath(contextMap);

        if (this._fileExists(`${dirPath}.package.manifest.json`)) {
            const pkg = fs.readFileSync(`${dirPath}.package.manifest.json`);
            return JSON.parse(pkg);
        }
    }

    _getManifest(dirPath) {
        const manifest = fs.readFileSync(`${dirPath}.local.manifest.json`);
        return JSON.parse(manifest);
    }

    createAllDirectories(folderPaths) {
        const directories = folderPaths.map(({ folderPath }) => folderPath);
        for (const f in directories) {
            const dir = directories[f];
            this.createDir(dir);
        }
    }

    async createEditableFiles(assets, context, bldr = true) {
        try {
            for (const a in assets) {
                const asset = assets[a];
                let objectIdKey;

                const assetType = (asset.assetType && asset.assetType.name) || asset.ContentType;

                if (asset.assetType && asset.assetType.objectIdKey) objectIdKey = asset.assetType.objectIdKey;

                const folderPath =
                    (asset.category && asset.category.folderPath) ||
                    (asset.assetType && asset.assetType.folder) ||
                    asset.folderPath ||
                    null;

                const id = asset.id || (objectIdKey && asset[objectIdKey]) || (asset.customerKey && asset.customerKey);

                const fileName = asset.name || asset.Name;

                let content;
                let ext;
                let dirPath;

                switch (assetType) {
                    case 'webpage':
                    case 'htmlemail':
                        content = asset.views.html.content;
                        ext = '.html';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                        break;
                    case 'codesnippetblock':
                    case 'htmlblock':
                    case 'jscoderesource':
                        content = asset.content;
                        ext = '.html';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                        break;
                    case 'textonlyemail':
                        content = asset.views.text.content;
                        ext = '.html';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                        break;
                    case 'queryactivity':
                        content = asset.queryText;
                        ext = '.sql';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                        break;
                    case 'ssjsactivity':
                        content = asset.script;
                        ext = '.html';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                        break;
                    default:
                        content = JSON.stringify(asset, null, 2);
                        ext = '.json';
                        dirPath = `${folderPath}/${fileName}${ext}`;
                }

                if (bldr) {
                    await this.appendBLDR({
                        id,
                        context,
                        bldrId: asset.bldrId,
                        folderPath: dirPath,
                    });
                }

                content = await utils.scrubConfig(content);
                await this.createFile(`${dirPath}`, content);
                display.render(null, `created: ${asset.name}`);
            }
        } catch (err) {
            display.render(null, `ERROR: ${err}`);
        }
    }

    async createFile(filePath, content) {
        const dirPathArr = filePath.split('/');
        dirPathArr.pop();
        const dirPath = dirPathArr.join('/');

        if (typeof content === 'object') {
            content = JSON.stringify(content, null, 2);
        }

        fs.writeFile(filePath, content, 'utf8', async (err) => {
            if (err) {
                await this.createDir(dirPath);
                await this.createFile(filePath, content);
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
            this.appendFile(filePath, content);
        } else {
            this.createFile(filePath, content);
        }
    }

    appendBLDR(obj, rootPath) {
        const bldrPath = rootPath ? `${rootPath}.bldr` : `./.bldr`;

        if (this._fileExists(bldrPath)) {
            const bldrJSON = this._parseJSON(bldrPath);
            const exists = bldrJSON.findIndex(({ id }) => id === obj.id) !== -1 ? true : false;

            if (!exists) bldrJSON.push(obj);

            fs.writeFileSync(bldrPath, JSON.stringify(bldrJSON, null, 2));
        } else {
            const init = [];
            fs.writeFileSync(bldrPath, JSON.stringify(init, null, 2));
            if (obj !== null) this.appendBLDR(obj);
        }
    }

    async manifestJSON(context, content, dirPath) {
        if (typeof content !== 'object') throw new Error('Content needs to be an object');

        if (!context) throw new Error('Context is required');

        const manifestPath = dirPath ? `${dirPath}.local.manifest.json` : `./.local.manifest.json`;

        // Manifest File exists
        if (this._fileExists(manifestPath)) {
            // Read ManifestJSON file from rooth dir
            const manifest = fs.readFileSync(manifestPath);
            let manifestJSON = JSON.parse(manifest);

            // Siloed write for instance details
            if (context === 'instanceDetails' && !Object.prototype.hasOwnProperty.call(manifestJSON, context)) {
                manifestJSON[context] = content;
                fs.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2));

                return;
            }

            // Itterate through content object
            for (const c in content) {
                if (
                    Object.prototype.hasOwnProperty.call(manifestJSON, context) &&
                    Object.prototype.hasOwnProperty.call(manifestJSON[context], c)
                ) {
                    const ctx = manifestJSON[context];
                    const items = content[c];

                    for (const i in items) {
                        const item = items[i];
                        let itemId;

                        // Content Builder assets should have have item.id
                        // Automation Studio assets get an assetType object with the key for their ID
                        if (Object.prototype.hasOwnProperty.call(item, 'id')) {
                            itemId = item.id;
                        } else {
                            const objectIdKey = (item && item.assetType && item.assetType.objectIdKey) || null;
                            itemId = objectIdKey ? item[objectIdKey] : null;
                        }

                        const manifestObj = ctx[c].find(({ id }) => id === itemId);

                        if (typeof manifestObj === 'undefined') {
                            ctx[c] = [...ctx[c], item];
                        } else {
                            if (!isEqual(item, manifestObj)) {
                                const updateIndex = ctx[c].findIndex(({ id }) => id === item.id);
                                ctx[c][updateIndex] = item;
                            }
                        }
                    }
                } else {
                    if (!manifestJSON[context]) {
                        manifestJSON[context] = {};
                    }

                    manifestJSON[context][c] = [...content[c]];
                }
            }

            let manifestStr = JSON.stringify(manifestJSON);
            let updatedManifest = JSON.parse(await utils.scrubConfig(manifestStr));

            fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));
        } else {
            const init = {};
            const state = utils.assignObject(stateConfiguration.get());
            init.instanceDetails = state;

            await fs.writeFileSync(manifestPath, JSON.stringify(init, null, 2));
            await this.manifestJSON(context, content, dirPath);
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
            console.error(err);
        }
    }
};
