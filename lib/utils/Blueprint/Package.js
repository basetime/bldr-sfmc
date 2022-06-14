const fs = require('fs');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const packageReference = require('../packageReference');

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
        const packageOut = {};
        const manifestJSON = await this.stash._getManifestAssetData();
        const contexts = this.contextMap.map(
            (contextItem) => contextItem.context
        );

        for (const c in contexts) {
            const context = contexts[c];
            packageOut[context] = {};

            if (Object.prototype.hasOwnProperty.call(manifestJSON, context)) {
                const assets = manifestJSON[contexts[c]]['assets'];
                const folders = manifestJSON[contexts[c]]['folders'];

                packageOut[context]['folders'] = folders.map((folder) => {
                    return {
                        folderPath: folder.folderPath,
                    };
                });

                packageOut[context]['assets'] = assets.map((asset) => {
                    // console.log(asset)
                    return {
                        bldrId: asset.bldrId,
                        name: asset.name,
                        assetType: asset.assetType,
                        category: {
                            folderPath: asset.category.folderPath,
                        },
                        content: this.getAssetContent(asset),
                    };
                });

                const dependencyList = await this.getAllAssetDependencies(
                    assets,
                    context
                );
                // console.log('dependencyList', JSON.stringify(dependencyList, null, 2));

                packageOut.dependencies = dependencyList.dependencies;
                packageOut[context]['assets'] = dependencyList.assets;
            }
        }

        console.log('PACKAGE OUT', JSON.stringify(packageOut, null, 2));
    }

    async getAllAssetDependencies(assets, context) {
        let dependencies = {};

        for (const a in assets) {
            let asset = assets[a];
            let content = await this.getAssetContent(asset);

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
                        context
                    );

                    let dependencyContext = dependency.context;
                    dependencies[dependencyContext] =
                        dependencies[dependencyContext] || Array();
                    dependencies[dependencyContext].push(dependency);

                    console.log('matchedValue', matchedValue);
                    console.log('bldrId', dependency.payload.bldrId);

                    content = content.replace(
                        matchedValue,
                        dependency.payload.bldrId
                    );

                    console.log('updated content', content);
                    asset.dependencies = asset.dependencies || new Array();
                    asset.dependencies.push(dependency.payload.bldrId);
                }
            }

            asset = await this.updateAssetContent(asset, content);
        }

        return {
            assets,
            dependencies,
        };
    }

    updateAssetContent(asset, content) {
        const assetType = asset.assetType.name;
        switch (assetType) {
            case 'webpage':
            case 'htmlemail':
                asset.views.html.content = content;
                break;
            case 'codesnippetblock':
            case 'htmlblock':
            case 'jscoderesource':
                asset.content = content;
                break;
            case 'textonlyemail':
                asset.views.text.content = content;
                break;
            case 'queryactivity':
                asset.queryText = content;
                break;
            case 'ssjsactivity':
                asset.script = content;
                break;
            default:
                content = null;
        }

        return asset;
    }

    getAssetContent(asset) {
        const assetType = asset.assetType.name;
        let content;

        switch (assetType) {
            case 'webpage':
            case 'htmlemail':
                content = asset.views.html.content;
                break;
            case 'codesnippetblock':
            case 'htmlblock':
            case 'jscoderesource':
                content = asset.content;
                break;
            case 'textonlyemail':
                content = asset.views.text.content;
                break;
            case 'queryactivity':
                content = asset.queryText;
                break;
            case 'ssjsactivity':
                content = asset.script;
                break;
            default:
                content = null;
        }

        return content;
    }

    async getAssetDependency(ref, value, asset, context) {
        let resp = {};
        // Generate new bldrId for asset
        const bldrId = utils.guid();

        switch (ref) {
            case 'Lookup':
            case 'LookupRows':
                resp.context = 'dataExtension';
                resp.payload = await this.getDataExtensionDependency(
                    value,
                    'dataExtension'
                );
                resp.payload.bldrId = utils.guid();
                resp.payload.assetType = {
                    name: 'dataextension',
                };
                break;
            case 'ContentBlockById':
                resp.context = 'contentBuilder';
                resp.payload = await this.getContentBuilderDependencyById(
                    value
                );
                resp.payload.bldrId = utils.guid();
                resp.payload.assetType = {
                    name: 'contentblock',
                };
                break;
            case 'ContentBlockByName':
                resp.context = 'contentBuilder';
                // resp.payload = await this.getContentBuilderDependencyByName(
                //     value
                // );
                resp.payload = {};
                resp.payload.bldrId = utils.guid();
                resp.payload.assetType = {
                    name: 'contentblock',
                };
                break;
            default:
        }

        return resp;
    }

    async getDataExtensionDependency(value, context) {
        const dataExtensionName = value.split(',')[0].trim();
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
                customerKey: dataExtension.Results[0].CustomerKey,
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
            return payload[0];
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
