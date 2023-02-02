const utils = require('../utils');
const packageReference = require('../packageReference');
const coreConfigurationOptions = require('../options');

const yargsInteractive = require('yargs-interactive');

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
module.exports = class Package {
    constructor(bldr, localFile, contextMap, store, stash, initiate) {
        this.bldr = bldr;
        this.localFile = localFile;
        this.contextMap = contextMap;
        this.store = store;
        this.stash = stash;
        this.initiate = initiate;
    }

    async package() {
        try {
            const dirPath = await this.localFile._getRootPath(this.contextMap);

            if (!this.localFile._fileExists(`${dirPath}.local.manifest.json`)) {
                throw new Error('Please run [ bldr init ] or clone SFMC assets before running [ bldr package ]');
            }

            const packageJSON = await this.localFile._getSFMCPackage();

            yargsInteractive()
                .usage('$bldr init [args]')
                .interactive(coreConfigurationOptions.pkg_init(packageJSON))
                .then(async (initResults) => {
                    let packageOut = {};
                    const sfmcConfig = (await this.getSFMCConfigSettings()) || null;
                    packageOut.name = initResults.packageName;
                    packageOut.version = initResults.packageVersion;
                    packageOut.repositoryUrl = initResults.repositoryUrl;

                    if (sfmcConfig) {
                        packageOut['sfmcConfig'] = sfmcConfig;
                    }

                    const manifestJSON = await this.stash._getManifestAssetData();

                    const contexts = this.contextMap.map((contextItem) => contextItem.context);

                    for (const c in contexts) {
                        const context = contexts[c];

                        if (Object.prototype.hasOwnProperty.call(manifestJSON, context)) {
                            const assets = manifestJSON[contexts[c]]['assets'];

                            packageOut[context] = {
                                assets: [],
                            };

                            packageOut[context]['assets'] = assets.map((asset) => {
                                return {
                                    bldrId: asset.bldrId,
                                    name: asset.name,
                                    assetType: asset.assetType,
                                    category: {
                                        folderPath: (asset.category && asset.category.folderPath) || asset.folderPath,
                                    },
                                    content: utils.getAssetContent(asset),
                                };
                            });

                            const dependencyList = await this.getAllAssetDependencies(assets, context);

                            const dependencies = dependencyList.dependencies;
                            packageOut[context]['assets'] = dependencyList.assets;

                            for (const d in dependencies) {
                                if (!Object.prototype.hasOwnProperty.call(packageOut, d)) {
                                    packageOut[d] = {
                                        assets: [],
                                    };
                                }

                                packageOut[d] = {
                                    assets: dependencies[d].map((dep) => dep.payload),
                                };
                            }
                        }
                    }

                    const rootDir = await this.localFile._getRootPath(this.contextMap);

                    await this.localFile.createFile(
                        `${rootDir}/.package.manifest.json`,
                        JSON.stringify(packageOut, null, 2)
                    );

                    await this.initiate.updateKeys();
                });
        } catch (err) {
            console.log(err.message);
        }
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

        if (context === 'contentBuilder') {
            for (const a in assets) {
                let asset = assets[a];
                let content = await utils.getAssetContent(asset);

                for (const p in packageReference) {
                    const ref = packageReference[p];
                    const regex = `(${ref}\\(['"](?<value>.+)['"])`;
                    const ampscriptRegex = new RegExp(regex, 'g');
                    const matches = content.matchAll(ampscriptRegex);

                    for (const match of matches) {
                        const groups = Object.assign(match.groups, {});
                        let matchedValue = groups.value;
                        matchedValue = matchedValue.replace(/['"]/gm, '');

                        let dependency = await this.getAssetDependency(ref, matchedValue, asset, assets);

                        if (dependency) {
                            let dependencyContext = dependency.context;
                            dependencies[dependencyContext] = dependencies[dependencyContext] || Array();

                            content = content.replace(dependency.matchedValue, dependency.payload.bldrId);

                            // remove matched value from dependency object
                            delete dependency.matchedValue;

                            dependencies[dependencyContext].push(dependency);

                            await this.localFile.createEditableFiles([dependency.payload], dependencyContext, true);

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

                            asset.dependencies = asset.dependencies || new Array();
                            asset.dependencies.push({
                                context: dependencyContext,
                                ref: ref,
                                bldrId: dependency.payload.bldrId,
                            });
                        } else {
                            let refBldrId;
                            let assetRefObject;
                            let dependencyContext;

                            switch (ref) {
                                case 'Lookup':
                                case 'LookupOrderedRows':
                                case 'LookupOrderedRowsCS':
                                case 'LookupRows':
                                case 'LookupRowsCS':
                                case 'DataExtensionRowCount':
                                case 'DeleteData':
                                case 'DeleteDE':
                                case 'InsertDE':
                                case 'UpdateData':
                                case 'UpdateDE':
                                case 'UpsertData':
                                case 'UpsertDE':
                                case 'ClaimRow':
                                    refBldrId = '';
                                    dependencyContext = 'dataExtension';
                                    break;
                                case 'ContentBlockById':
                                case 'ContentBlockByID':
                                    assetRefObject = assets.find((depAsset) => depAsset.id === Number(matchedValue));
                                    refBldrId = assetRefObject.bldrId;
                                    dependencyContext = 'contentBuilder';

                                    break;
                                case 'ContentBlockByName':
                                    assetRefObject = assets.find((depAsset) => {
                                        return (
                                            `${depAsset.category.folderPath.replaceAll('/', '\\')}\\${
                                                depAsset.name
                                            }` === matchedValue
                                        );
                                    });

                                    if (!assetRefObject) {
                                        assetRefObject = assets.find((depAsset) => {
                                            return (
                                                `${depAsset.category.folderPath.replaceAll('/', '\\\\')}\\\\${
                                                    depAsset.name
                                                }` === matchedValue
                                            );
                                        });
                                    }

                                    refBldrId = assetRefObject.bldrId;
                                    dependencyContext = 'contentBuilder';
                                    break;
                            }

                            content = content.replace(matchedValue, refBldrId);

                            asset.dependencies = asset.dependencies || new Array();
                            asset.dependencies.push({
                                context: dependencyContext,
                                ref: ref,
                                bldrId: refBldrId,
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
        } else if (context === 'automationStudio') {
            // for (const a in assets) {
            //     let asset = assets[a];
            //     console.log(asset.name)
            // }
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

        let contentBlockPathArray;
        let contentBlockName;
        let contentBlockFolder;

        switch (ref) {
            case 'Lookup':
            case 'LookupOrderedRows':
            case 'LookupOrderedRowsCS':
            case 'LookupRows':
            case 'LookupRowsCS':
            case 'DataExtensionRowCount':
            case 'DeleteData':
            case 'DeleteDE':
            case 'InsertDE':
            case 'UpdateData':
            case 'UpdateDE':
            case 'UpsertData':
            case 'UpsertDE':
            case 'ClaimRow':
                resp.matchedValue = value.split(',')[0].trim();

                resp.context = 'dataExtension';
                resp.payload = await this.getDataExtensionDependency(resp.matchedValue);
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;
                resp.payload.assetType = {
                    name: 'dataextension',
                };

                break;
            case 'ContentBlockById':
            case 'ContentBlockByID':
            case 'ContentBlockbyID':
                // Do not capture existing Content Builder assets if they already exist in package
                assetExists = assets.find((item) => Number(item.id) === Number(value)) || assetExists;

                // Do not capture existing Content Builder assets if they already exist in package
                if (assetExists) {
                    resp = null;
                    break;
                }

                resp.context = 'contentBuilder';
                resp.payload = await this.getContentBuilderDependencyById(value);
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;

                break;
            case 'ContentBlockByName':
                contentBlockPathArray = value.split('\\').filter(Boolean);

                contentBlockName = contentBlockPathArray.pop();
                contentBlockFolder = contentBlockPathArray[contentBlockPathArray.length - 1];

                // Do not capture existing Content Builder assets if they already exist in package
                assetExists = assets.find((item) => item.name === contentBlockName) || assetExists;

                if (assetExists) {
                    resp = null;
                    break;
                }

                resp.context = 'contentBuilder';
                resp.payload = await this.getContentBuilderDependencyByName(contentBlockName, contentBlockFolder);
                resp.bldrId = bldrId;
                resp.payload.bldrId = bldrId;

                break;
            default:
        }

        return resp;
    }

    async getDataExtensionDependency(dataExtensionName) {
        const dataExtension = await this.bldr.dataExtension.get(dataExtensionName);
        if (
            Object.prototype.hasOwnProperty.call(dataExtension, 'Results') &&
            Object.prototype.hasOwnProperty.call(dataExtension.Results[0], 'CustomerKey')
        ) {
            const dataExtensionFields = await this.bldr.dataExtension.getFields(dataExtension.Results[0].CustomerKey);
            const folderPath = await this.getDependencyFolderPath('dataExtension', dataExtension.Results[0].CategoryID);

            let sendable = dataExtension.Results[0].IsSendable;
            let retention = dataExtension.Results[0].DataRetentionPeriodLength;

            if (retention && retention > 0) {
                retention = true;
            }

            if (sendable) {
                let sendableName = dataExtension.Results[0].SendableDataExtensionField.Name;
                let RelatesOnSub = dataExtension.Results[0].SendableSubscriberField.Name;
            }

            if (retention) {
                let retentionPeriodLength = dataExtension.Results[0].DataRetentionPeriodLength;
                let retentionPeriod = dataExtension.Results[0].DataRetentionPeriod;
                let deleteRetentionPeriod = dataExtension.Results[0].DeleteAtEndOfRetentionPeriod;
                let rowRetention = dataExtension.Results[0].RowBasedRetention;
                let resetRetention = dataExtension.Results[0].ResetRetentionPeriodOnImport;
                let retentionPeriodUnit = dataExtension.Results[0].DataRetentionPeriodUnitOfMeasure;
            }

            let fieldLength = dataExtensionFields.Results.length;
            let dataExtensionFieldArr = dataExtensionFields.Results;

            let fieldArray = [];

            // Organize and format DE Field Schema
            for (let a = 0; a < fieldLength; a++) {
                let fieldObj = dataExtensionFieldArr[a];

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
                    let sendableFieldType = fieldObj.FieldType;
                }

                //Reset fieldObj
                fieldObj = '';
            }

            //Get DE Payload
            let de = {
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
        let assetResp = await this.bldr.asset.getById(value);
        const dirPath = await this.localFile._getRootPath(this.contextMap);
        const manafestJSON = await this.localFile._getManifest(dirPath);
        const contentBuilderFolders = manafestJSON.contentBuilder.folders;

        const payload = await utils.formatContentBuilderDataForFile(this.bldr, assetResp, contentBuilderFolders);

        if (payload.length) {
            delete payload[0].id;
            delete payload[0].customerKey;
            delete payload[0].category.id;
            delete payload[0].category.name;
            delete payload[0].category.parentId;

            return payload[0];
        }
    }

    async getContentBuilderDependencyByName(contentBlockName, contentBlockFolder) {
        let assetResp = await this.bldr.asset.getByNameAndFolder(contentBlockName, contentBlockFolder);
        const dirPath = await this.localFile._getRootPath(this.contextMap);
        const manafestJSON = await this.localFile._getManifest(dirPath);
        const contentBuilderFolders = manafestJSON.contentBuilder.folders;

        if (assetResp.items.length > 0) {
            assetResp = assetResp.items[0];

            const payload = await utils.formatContentBuilderDataForFile(this.bldr, assetResp, contentBuilderFolders);

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
        const rootContext = this.contextMap.find((ctx) => ctx.context === contentType);
        const rootFolder = rootContext.root;
        let folderPath = rootFolder;

        const initFolder = await this.bldr.folder.get(contentType.toLowerCase(), id, subfolders);
        if (initFolder.OverallStatus !== 'OK') {
            throw new Error(initFolder.OverallStatus);
        }

        if (Object.prototype.hasOwnProperty.call(initFolder, 'Results') && initFolder.Results.length !== 0) {
            folderPath += `/${initFolder.Results[0].Name}`;
            let parentFolder = initFolder.Results[0].ParentFolder.Name;

            if (parentFolder === rootFolder) {
                return folderPath;
            } else {
                do {
                    let folderResp = await this.bldr.folder.get(contentType.toLowerCase(), id, subfolders);
                    if (folderResp.OverallStatus !== 'OK') {
                        throw new Error(folderResp.OverallStatus);
                    }

                    if (
                        Object.prototype.hasOwnProperty.call(folderResp, 'Results') &&
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
