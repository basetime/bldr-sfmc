const fs = require('fs');
const getFiles = require('node-recursive-directory');

const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const packageReference = require('../packageReference');
const yargsInteractive = require('yargs-interactive');
const coreConfigurationOptions = require('../options');
const { styles, width } = display.init();

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
module.exports = class Package {
    constructor(bldr, localFile, contextMap, store, stash) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
        this.stash = stash;
    }

    async package() {
        try {
            const dirPath = await this.localFile._getRootPath(this.contextMap);

            if (!this.localFile._fileExists(`${dirPath}.local.manifest.json`)) {
                throw new Error('Please run [ bldr init ] or clone SFMC assets before running [ bldr package ]')
            }

            yargsInteractive()
                .usage('$bldr init [args]')
                .interactive(coreConfigurationOptions.pkg_init())
                .then(async (initResults) => {
                    const packageOut = {};
                    const sfmcConfig = (await this.getSFMCConfigSettings()) || null;
                    packageOut.packageName = initResults.packageName;

                    if (sfmcConfig) {
                        packageOut['sfmcConfig'] = sfmcConfig;
                    }

                    const manifestJSON = await this.stash._getManifestAssetData();
                    const contexts = this.contextMap.map(
                        (contextItem) => contextItem.context
                    );

                    for (const c in contexts) {
                        const context = contexts[c];

                        if (
                            Object.prototype.hasOwnProperty.call(
                                manifestJSON,
                                context
                            )
                        ) {
                            const assets = manifestJSON[contexts[c]]['assets'];
                            const folders = manifestJSON[contexts[c]]['folders'];

                            packageOut[context] = {
                                folders: [],
                                assets: [],
                            };

                            packageOut[context]['folders'] = folders.map(
                                (folder) => {
                                    return {
                                        folderPath: folder.folderPath,
                                    };
                                }
                            );

                            packageOut[context]['assets'] = assets.map((asset) => {
                                // console.log(asset)
                                return {
                                    bldrId: asset.bldrId,
                                    name: asset.name,
                                    assetType: asset.assetType,
                                    category: {
                                        folderPath: asset.category.folderPath,
                                    },
                                    content: utils.getAssetContent(asset),
                                };
                            });

                            const dependencyList =
                                await this.getAllAssetDependencies(assets, context);

                            const dependencies = dependencyList.dependencies;
                            packageOut[context]['assets'] = dependencyList.assets;

                            console.log(dependencies);
                            for (const d in dependencies) {
                                if (
                                    !Object.prototype.hasOwnProperty.call(
                                        packageOut,
                                        d
                                    )
                                ) {
                                    packageOut[d] = {
                                        folders: [],
                                        assets: [],
                                    };
                                }

                                packageOut[d] = {
                                    folders: dependencies[d].map(
                                        (dep) => dep.payload.category
                                    ),
                                    assets: dependencies[d].map(
                                        (dep) => dep.payload
                                    ),
                                };
                            }
                        }
                    }

                    const rootDir = await this.localFile._getRootPath(
                        this.contextMap
                    );
                    await this.localFile.createFile(
                        `${rootDir}/.package.manifest.json`,
                        JSON.stringify(packageOut, null, 2)
                    );
                });
        } catch (err) {
            console.log(err.message)
        }
    }

    /**
     * future feature update packageJSON prior to being deployed based on updated folder names
     */
    async updatePkgFolders() {
        const ctx = this.contextMap;
        const packageJSON = this.localFile._getSFMCPackage();

        for (const c in ctx) {
            const contextFolder = ctx[c].root;
            const context = ctx[c].context;

            if (packageJSON[context]) {
                const dir = await this.getDirectories(contextFolder);
                const packageFolders = packageJSON[context]['folders'].map(
                    (folder) => folder.folderPath
                );
                const packageAssetFolders = packageJSON[context]['assets'].map(
                    ({ category }) => category.folderPath
                );

                console.log({ packageFolders, packageAssetFolders });

                dir.forEach(async (dirPath) => {
                    const categoryDetails = await utils.filePathDetails(
                        dirPath
                    );
                    const projectPathArr =
                        categoryDetails.projectPath.split('/');

                    console.log(categoryDetails);
                });
            }
        }
    }

    async getDirectories(contextFolder) {
        return getFiles(`./${contextFolder}`);
    }

    async getSFMCConfigSettings() {
        let sfmcConfig = {};
        const configTemplate = await this.localFile._getSFMCConfig();

        if (!configTemplate) {
            return null;
        }

        for (const t in configTemplate) {
            sfmcConfig[t] = '';
        }

        return sfmcConfig;
    }

    async getAllAssetDependencies(assets, context) {
        let dependencies = {};

        if (context !== 'contentBuilder') {
            return {
                assets: [],
                dependencies: []
            }
        }

        for (const a in assets) {
            let asset = assets[a];
            let content = await utils.getAssetContent(asset);
            for (const p in packageReference) {
                const ref = packageReference[p];
                const regex = `(${ref}\\()(?<value>.+)(\\))`;
                const ampscriptRegex = new RegExp(regex, 'm');
                const match = content.match(ampscriptRegex);
                if (match) {
                    const groups = Object.assign(match.groups, {});
                    let matchedValue = groups.value;
                    matchedValue = matchedValue.replace(/['"]/gm, '');

                    let dependency = await this.getAssetDependency(
                        ref,
                        matchedValue,
                        asset,
                        assets
                    );

                    if (dependency) {
                        let dependencyContext = dependency.context;
                        dependencies[dependencyContext] =
                            dependencies[dependencyContext] || Array();

                        content = content.replace(
                            dependency.matchedValue,
                            dependency.payload.bldrId
                        );

                        // remove matched value from dependency object
                        delete dependency.matchedValue;

                        dependencies[dependencyContext].push(dependency);

                        await this.localFile.createEditableFiles(
                            [dependency.payload],
                            dependencyContext,
                            true
                        );

                        // Update ManifestJSON file with responses
                        await this.localFile.manifestJSON(
                            dependencyContext,
                            { folders: [dependency.payload.category] },
                            null
                        );

                        await this.localFile.manifestJSON(
                            dependencyContext,
                            { assets: [dependency.payload] },
                            null
                        );

                        // console.log('updated content', content);
                        asset.dependencies = asset.dependencies || new Array();
                        asset.dependencies.push({
                            context: dependencyContext,
                            ref: ref, bldrId:
                                dependency.payload.bldrId
                        });
                    } else {
                        let refBldrId;
                        let assetRefObject;
                        let dependencyContext;

                        switch (ref) {
                            case 'Lookup':
                            case 'LookupRows':
                            case 'ClaimRow':
                            case 'DataExtensionRowCount':
                            case 'DeleteData':
                            case 'DeleteDE':
                            case 'InsertDE':
                            case 'UpdateData':
                            case 'UpdateDE':
                            case 'UpsertData':
                            case 'UpsertDE':
                            case 'Lookup':
                            case 'LookupOrderedRows':
                            case 'LookupOrderedRowsCS':
                            case 'LookupRows':
                            case 'LookupRowsCS':
                                refBldrId = '';
                                dependencyContext = 'dataExtension'
                                break;
                            case 'ContentBlockById':
                                assetRefObject = assets.find(
                                    (depAsset) =>
                                        depAsset.id === Number(matchedValue)
                                );
                                refBldrId = assetRefObject.bldrId;
                                dependencyContext = 'contentBuilder';

                                break;
                            case 'ContentBlockByName':
                                console.log('matchedValue', matchedValue);
                                assetRefObject = assets.find((depAsset) => {
                                    return (
                                        `${depAsset.category.folderPath.replaceAll(
                                            '/',
                                            '\\'
                                        )}\\${depAsset.name}` === matchedValue
                                    );
                                });
                                refBldrId = assetRefObject.bldrId;
                                dependencyContext = 'contentBuilder';
                                break;
                        }

                        content = content.replace(matchedValue, refBldrId);

                        asset.dependencies = asset.dependencies || new Array();
                        asset.dependencies.push({
                            context: dependencyContext,
                            ref: ref,
                            bldrId: refBldrId
                        });
                    }
                }
            }

            delete asset.id;
            delete asset.customerKey;
            delete asset.category.id;
            delete asset.category.name;
            delete asset.category.parentId;

            asset = await utils.updateAssetContent(asset, content);
        }

        return {
            assets,
            dependencies,
        };
    }

    async getAssetDependency(ref, value, asset, assets) {
        let resp = {};
        resp.matchedValue = value;
        resp.ref = ref;

        // Generate new bldrId for asset
        const bldrId = utils.guid();
        let assetExists = false;

        switch (ref) {
            case 'Lookup':
            case 'LookupRows':
            case 'LookupRows':
            case 'ClaimRow':
            case 'DataExtensionRowCount':
            case 'DeleteData':
            case 'DeleteDE':
            case 'InsertDE':
            case 'UpdateData':
            case 'UpdateDE':
            case 'UpsertData':
            case 'UpsertDE':
            case 'Lookup':
            case 'LookupOrderedRows':
            case 'LookupOrderedRowsCS':
            case 'LookupRows':
            case 'LookupRowsCS':
                const dataExtensionName = value.split(',')[0].trim();
                resp.matchedValue = dataExtensionName;

                resp.context = 'dataExtension';
                resp.payload = await this.getDataExtensionDependency(
                    dataExtensionName,
                    'dataExtension'
                );
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;

                break;
            case 'ContentBlockById':
                // Do not capture existing Content Builder assets if they already exist in package
                assetExists =
                    assets.find((item) => Number(item.id) === Number(value)) ||
                    assetExists;

                if (assetExists) {
                    resp = null;
                    break;
                }

                resp.context = 'contentBuilder';
                resp.payload = await this.getContentBuilderDependencyById(
                    value
                );
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;

                break;
            case 'ContentBlockByName':
                const contentBlockPathArray = value.split('\\');
                const contentBlockName = contentBlockPathArray.pop();
                const contentBlockFolder =
                    contentBlockPathArray[contentBlockPathArray.length - 1];

                // Do not capture existing Content Builder assets if they already exist in package
                assetExists =
                    assets.find((item) => item.name === contentBlockName) ||
                    assetExists;

                if (assetExists) {
                    resp = null;
                    break;
                }

                resp.context = 'contentBuilder';
                resp.payload = await this.getContentBuilderDependencyByName(
                    contentBlockName,
                    contentBlockFolder
                );
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;

                break;
            default:
        }

        return resp;
    }

    async getDataExtensionDependency(dataExtensionName, context) {
        const dataExtension = await this.bldr.dataExtension.get(
            dataExtensionName
        );
        if (
            Object.prototype.hasOwnProperty.call(dataExtension, 'Results') &&
            Object.prototype.hasOwnProperty.call(
                dataExtension.Results[0],
                'CustomerKey'
            )
        ) {
            const dataExtensionFields = await this.bldr.dataExtension.getFields(
                dataExtension.Results[0].CustomerKey
            );
            const folderPath = await this.getDependencyFolderPath(
                'dataExtension',
                dataExtension.Results[0].CategoryID
            );

            var sendable = dataExtension.Results[0].IsSendable;
            var retention = dataExtension.Results[0].DataRetentionPeriodLength;

            if (retention && retention > 0) {
                retention = true;
            }

            if (sendable) {
                var sendableName =
                    dataExtension.Results[0].SendableDataExtensionField.Name;
                var RelatesOnSub =
                    dataExtension.Results[0].SendableSubscriberField.Name;
            }

            if (retention) {
                var retentionPeriodLength =
                    dataExtension.Results[0].DataRetentionPeriodLength;
                var retentionPeriod =
                    dataExtension.Results[0].DataRetentionPeriod;
                var deleteRetentionPeriod =
                    dataExtension.Results[0].DeleteAtEndOfRetentionPeriod;
                var rowRetention = dataExtension.Results[0].RowBasedRetention;
                var resetRetention =
                    dataExtension.Results[0].ResetRetentionPeriodOnImport;
                var retentionPeriodUnit =
                    dataExtension.Results[0].DataRetentionPeriodUnitOfMeasure;
            }

            var fieldLength = dataExtensionFields.Results.length;
            var dataExtensionFieldArr = dataExtensionFields.Results;

            var fieldArray = [];

            // Organize and format DE Field Schema
            for (var a = 0; a < dataExtensionFieldArr.length; a++) {
                var fieldObj = dataExtensionFieldArr[a];

                //Fields that need to be removed prior to creation of new DE
                delete fieldObj.AttributeMaps;
                delete fieldObj.CustomerKey;
                delete fieldObj.ObjectID;
                if (fieldObj.MaxLength == '' || fieldObj.MaxLength == 0) {
                    delete fieldObj.MaxLength;
                }
                delete fieldObj.StorageType;
                delete fieldObj.DataExtension;
                delete fieldObj.DataType;
                delete fieldObj.IsCreatable;
                delete fieldObj.IsUpdatable;
                delete fieldObj.IsRetrievable;
                delete fieldObj.IsQueryable;
                delete fieldObj.IsFilterable;
                delete fieldObj.IsPartnerProperty;
                delete fieldObj.IsAccountProperty;
                delete fieldObj.PartnerMap;
                delete fieldObj.Markups;
                delete fieldObj.Precision;

                if (fieldObj.FieldType !== 'Decimal') {
                    delete fieldObj.Scale;
                }

                delete fieldObj.Label;
                if (fieldObj.MinLength == '' || fieldObj.MinLength == 0) {
                    delete fieldObj.MinLength;
                }
                delete fieldObj.CreatedDate;
                delete fieldObj.ModifiedDate;
                delete fieldObj.ID;
                delete fieldObj.IsRestrictedPicklist;
                delete fieldObj.PicklistItems;
                delete fieldObj.IsSendTime;
                delete fieldObj.DisplayOrder;
                delete fieldObj.References;
                delete fieldObj.RelationshipName;
                delete fieldObj.Status;
                delete fieldObj.IsContextSpecific;
                delete fieldObj.Client;
                delete fieldObj.PartnerProperties;

                const field = {
                    partnerKey: fieldObj.PartnerKey,
                    name: fieldObj.Name,
                    defaultValue: fieldObj.DefaultValue,
                    maxLength: fieldObj.MaxLength,
                    isRequired: fieldObj.IsRequired,
                    ordinal: fieldObj.Ordinal,
                    isPrimaryKey: fieldObj.IsPrimaryKey,
                    fieldType: fieldObj.FieldType,
                };

                if (fieldObj.FieldType === 'Decimal') {
                    field.scale = fieldObj.Scale;
                }

                fieldArray.push(field);

                //set sendable field type
                if (sendableName == fieldObj.Name) {
                    var sendableFieldType = fieldObj.FieldType;
                }

                //Reset fieldObj
                var fieldObj = '';
            }

            //Get DE Payload
            var de = {
                name: dataExtensionName,
                customerKey: dataExtensionName,
                description: dataExtension.Results[0].Description,
                fields: fieldArray,
                category: {
                    folderPath,
                },
            };

            if (sendable) {
                if ((RelatesOnSub = '_SubscriberKey')) {
                    RelatesOnSub = 'Subscriber Key';
                }

                de.isSendable = true;
                de.sendableDataExtensionField = {
                    name: sendableName,
                    fieldType: sendableFieldType,
                };
                de.sendableSubscriberField = { name: RelatesOnSub };
            }

            if (retention) {
                de.dataRetentionPeriodLength = retentionPeriodLength;
                de.dataRetentionPeriod = retentionPeriod;
                de.deleteAtEndOfRetentionPeriod = deleteRetentionPeriod;
                de.rowBasedRetention = rowRetention;
                de.resetRetentionPeriodOnImport = resetRetention;
                de.dataRetentionPeriodUnitOfMeasure = retentionPeriodUnit;
            }

            return de;
        }
    }

    async getContentBuilderDependencyById(value) {
        const assetResp = await this.bldr.asset.getById(value);
        const dirPath = await this.localFile._getRootPath(this.contextMap);
        const manafestJSON = await this.localFile._getManifest(dirPath);
        const contentBuilderFolders = manafestJSON.contentBuilder.folders;

        const payload = await utils.formatContentBuilderDataForFile(
            this.bldr,
            assetResp,
            contentBuilderFolders
        );

        if (payload.length) {
            delete payload[0].id;
            delete payload[0].customerKey;
            delete payload[0].category.id;
            delete payload[0].category.name;
            delete payload[0].category.parentId;

            return payload[0];
        }
    }

    async getContentBuilderDependencyByName(
        contentBlockName,
        contentBlockFolder
    ) {
        let assetResp = await this.bldr.asset.getByNameAndFolder(
            contentBlockName,
            contentBlockFolder
        );
        const dirPath = await this.localFile._getRootPath(this.contextMap);
        const manafestJSON = await this.localFile._getManifest(dirPath);
        const contentBuilderFolders = manafestJSON.contentBuilder.folders;

        if (assetResp.items.length > 0) {
            assetResp = assetResp.items[0];

            const payload = await utils.formatContentBuilderDataForFile(
                this.bldr,
                assetResp,
                contentBuilderFolders
            );

            if (payload.length) {
                delete payload[0].id;
                delete payload[0].customerKey;
                delete payload[0].category.id;
                delete payload[0].category.name;
                delete payload[0].category.parentId;

                return payload[0];
            }
        }
    }

    async getDependencyFolderPath(contentType, id, subfolders) {
        const rootContext = this.contextMap.find(
            (ctx) => ctx.context === contentType
        );
        const rootFolder = rootContext.root;
        let folderPath = rootFolder;

        const initFolder = await this.bldr.folder.get(
            contentType.toLowerCase(),
            id,
            subfolders
        );
        if (initFolder.OverallStatus !== 'OK') {
            throw new Error(initFolder.OverallStatus);
        }

        if (
            Object.prototype.hasOwnProperty.call(initFolder, 'Results') &&
            initFolder.Results.length !== 0
        ) {
            folderPath += `/${initFolder.Results[0].Name}`;
            let parentFolder = initFolder.Results[0].ParentFolder.Name;

            if (parentFolder === rootFolder) {
                return folderPath;
            } else {
                do {
                    let folderResp = await this.bldr.folder.get(
                        contentType.toLowerCase(),
                        id,
                        subfolders
                    );
                    if (folderResp.OverallStatus !== 'OK') {
                        throw new Error(folderResp.OverallStatus);
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(
                            folderResp,
                            'Results'
                        ) &&
                        folderResp.Results.length !== 0
                    ) {
                        folderPath += `/${folderResp.Results[0].Name}`;
                        parentFolder = folderResp.Results[0].ParentFolder.Name;
                    }
                } while (parentFolder !== rootFolder);
            }
        }

        return folderPath;
    }
};
