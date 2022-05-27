const fs = require('fs');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const packageReference = require('../packageReference');

const { styles, width } = display.init();

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
                        name: folder.name,
                        categoryType: folder.categoryType,
                        folderPath: folder.folderPath,
                    };
                });

                packageOut[context]['assets'] = assets.map((asset) => {
                    return {
                        bldrId: asset.bldrId,
                        name: asset.name,
                        assetType: asset.assetType,
                        category: {
                            name: asset.category.name,
                            folderPath: asset.category.folderPath,
                        },
                    };
                });

                const dependancyList = await this.getAllAssetDependencies(
                    assets,
                    context
                );
            }
        }

        console.log(JSON.stringify(packageOut, null, 2));
    }

    async getAllAssetDependencies(assets, context) {
        const dependencies = new Array();

        for (const a in assets) {
            const asset = assets[a];
            const content = await this.getAssetContent(asset);

            const matches = packageReference.map(async (ref) => {
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
                    console.log(JSON.stringify(dependency, null, 2));
                }
            });
        }
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
                resp.payload = await this.getContentBuilderDependency(
                    value
                );
                resp.payload.bldrId = utils.guid();
                // resp.payload.assetType = {
                //     name: 'dataextension',
                // };
                break;
            case 'ContentBlockByName':
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

    async getContentBuilderDependency(value){
        const assetResp = await this.bldr.asset.getById(value)
        console.log('asset Resp', JSON.stringify(assetResp,null,2))
        return assetResp
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
