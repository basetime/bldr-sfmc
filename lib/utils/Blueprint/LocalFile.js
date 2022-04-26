const fs = require('fs');
const fsPromises = require('fs').promises;
const isEqual = require('lodash.isequal');
const path = require('path');
const Conf = require('conf');

const display = require('../displayStyles');

const utils = require('../utils');
const stateConfiguration = new Conf({
    configName: `sfmc__stateManagement`,
});

module.exports = class LocalFile {
    constructor(bldr, store, contextMap) {
        this.bldr = bldr;
        this.store = store;
        this.contextMap = contextMap;
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

    async createEditableFiles(assets, context) {
        try {
            for (const a in assets) {
                const asset = assets[a];
                let objectIdKey;

                const assetType =
                    (asset.assetType && asset.assetType.name) ||
                    asset.ContentType;

                if (asset.assetType && asset.assetType.objectIdKey)
                    objectIdKey = asset.assetType.objectIdKey;

                const folderPath =
                    (asset.category && asset.category.folderPath) ||
                    (asset.assetType && asset.assetType.folder) ||
                    asset.folderPath ||
                    null;

                const id = asset.id || (objectIdKey && asset[objectIdKey]);

                const fileName = asset.name;

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

                await this.appendBLDR({
                    id,
                    context,
                    bldrId: asset.bldrId,
                    folderPath: dirPath,
                });

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
            const exists =
                bldrJSON.findIndex(({ id }) => id === obj.id) !== -1
                    ? true
                    : false;

            if (!exists) bldrJSON.push(obj);

            fs.writeFileSync(bldrPath, JSON.stringify(bldrJSON, null, 2));
        } else {
            const init = [];
            fs.writeFileSync(bldrPath, JSON.stringify(init, null, 2));
            this.appendBLDR(obj);
        }
    }

    manifestJSON(context, content, dirPath) {
        if (typeof content !== 'object')
            throw new Error('Content needs to be an object');

        if (!context) throw new Error('Context is required');

        const manifestPath = dirPath
            ? `${dirPath}.local.manifest.json`
            : `./.local.manifest.json`;

        // Manifest File exists
        if (this._fileExists(manifestPath)) {
            // Read ManifestJSON file from rooth dir
            const manifest = fs.readFileSync(manifestPath);
            let manifestJSON = JSON.parse(manifest);

            // Siloed write for instance details
            if (
                context === 'instanceDetails' &&
                !Object.prototype.hasOwnProperty.call(manifestJSON, context)
            ) {
                manifestJSON[context] = content;
                fs.writeFileSync(
                    manifestPath,
                    JSON.stringify(manifestJSON, null, 2)
                );

                return;
            }

            // Itterate through content object
            for (const c in content) {
                if (
                    Object.prototype.hasOwnProperty.call(
                        manifestJSON,
                        context
                    ) &&
                    Object.prototype.hasOwnProperty.call(
                        manifestJSON[context],
                        c
                    )
                ) {
                    const ctx = manifestJSON[context];
                    const items = content[c];

                    for (const i in items) {
                        const item = items[i];

                        if (Object.prototype.hasOwnProperty.call(item, 'id')) {
                            const manifestObj = ctx[c].find(
                                ({ id }) => id === item.id
                            );

                            if (typeof manifestObj === 'undefined') {
                                ctx[c] = [...ctx[c], item];
                            } else {
                                if (!isEqual(item, manifestObj)) {
                                    const updateIndex = ctx[c].findIndex(
                                        ({ id }) => id === item.id
                                    );
                                    ctx[c][updateIndex] = item;
                                }
                            }
                        }
                    }
                } else {
                    if (!manifestJSON[context]) manifestJSON[context] = {};

                    manifestJSON[context][c] = [...content[c]];
                }
            }

            fs.writeFileSync(
                manifestPath,
                JSON.stringify(manifestJSON, null, 2)
            );
        } else {
            const init = {};
            const state = utils.assignObject(stateConfiguration.get());
            init.instanceDetails = state;

            fs.writeFileSync(manifestPath, JSON.stringify(init, null, 2));
            this.manifestJSON(context, content, dirPath);
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
