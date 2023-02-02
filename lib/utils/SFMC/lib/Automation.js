const utils = require('../../utils');
const automationDefinition = require('./definitions/Automation');
const emailSendDefinition = require('./definitions/EmailSendDefinition');

module.exports = class Automation {
    constructor(rest, soap) {
        this.rest = rest;
        this.soap = soap;
    }

    async getByFolderArray(folderIds, cb_clone) {
        try {
            const items = new Array();

            if (!Array.isArray(folderIds)) throw new Error('folderIds argument must be an array');

            const automationIds = await this.getAutomationKeysByFolder(folderIds);

            const automations = await this.getAutomationsByKey(automationIds);
            const automationStepDefinitions = await this.getAutomationActivities(automations, cb_clone);

            items.push(...automations, ...automationStepDefinitions);

            return {
                items,
            };
        } catch (err) {
            console.log(err);
        }
    }

    async getById(id, cb_clone) {
        try {
            const items = new Array();

            const automations = await this.getAutomationsByKey(id);
            const automationStepDefinitions = await this.getAutomationActivities(automations, cb_clone);

            items.push(...automations, ...automationStepDefinitions);

            return {
                items,
            };
        } catch (err) {
            console.log(err.response.data.message);
        }
    }

    async getAutomationKeysByFolder(folderIds) {
        let automations = new Array();

        for (const f in folderIds) {
            const folderId = folderIds[f];
            const autoRequest = await this.rest.get(
                `/legacy/v1/beta/automations/automation/definition/?$sort=lastRunTime desc&categoryId=${folderId}`
            );

            if (Object.prototype.hasOwnProperty.call(autoRequest, 'entry')) {
                automations.push(...autoRequest.entry);
            }
        }

        return automations.map((automation) => automation.id);
    }

    async getAutomationsByKey(automationKeys) {
        const automations = new Array();
        const assetType = {
            api: 'automations',
            name: 'automations',
            objectIdKey: 'id',
            folder: 'Automation Studio/my automations',
        };

        if (Array.isArray(automationKeys)) {
            for (const a in automationKeys) {
                const automationKey = automationKeys[a];
                const autoRequest = await this.rest.get(`/automation/v1/automations/${automationKey}`);

                if (Object.prototype.hasOwnProperty.call(autoRequest, 'id')) {
                    autoRequest.assetType = assetType;
                    automations.push(autoRequest);
                }
            }
        } else {
            const autoRequest = await this.rest.get(`/automation/v1/automations/${automationKeys}`);

            if (Object.prototype.hasOwnProperty.call(autoRequest, 'id')) {
                autoRequest.assetType = assetType;
                automations.push(autoRequest);
            }
        }

        return automations;
    }

    async getAutomationActivities(automations, cb_clone) {
        const activities = new Array();

        if (Array.isArray(automations)) {
            for (const a in automations) {
                const automation = automations[a];

                if (Object.prototype.hasOwnProperty.call(automation, 'steps')) {
                    for (const as in automation.steps) {
                        const steps = automation.steps[as];

                        for (const sa in steps.activities) {
                            const activity = steps.activities[sa];

                            const assetType = await utils.identifyAutomationStudioActivityType(activity.objectTypeId);

                            if (assetType) {
                                // Most activities can be pulled from the automations endpoint
                                const activityObjectId = activity.activityObjectId;
                                let stepActivity;

                                // EmailSendDefinitions are not on the automations REST endpoint
                                if (assetType.name === 'userinitiatedsend') {
                                    const soapResp = await this.soap.retrieve(
                                        'EmailSendDefinition',
                                        emailSendDefinition,
                                        {
                                            filter: {
                                                leftOperand: 'ObjectID',
                                                operator: 'equals',
                                                rightOperand: activityObjectId,
                                            },
                                        }
                                    );

                                    if (soapResp.OverallStatus !== 'OK' || soapResp.Results.length === 0) {
                                        throw new Error(soapResp.OverallStatus);
                                    }

                                    const result = soapResp.Results[0];
                                    const legacyId = result.Email.ID;
                                    const emailBldrId = await cb_clone.cloneFromID(legacyId, null, true);

                                    stepActivity = {
                                        ObjectID: result.ObjectID,
                                        CustomerKey: result.CustomerKey,
                                        Name: result.Name,
                                        Description: result.Description,
                                        CategoryID: result.CategoryID,
                                        SendClassification: {
                                            CustomerKey: result.SendClassification.CustomerKey,
                                        },
                                        SuppressTracking: result.SuppressTracking,
                                        IsSendLogging: result.IsSendLogging,
                                        SendDefinitionList: {
                                            PartnerKey: result.SendDefinitionList.PartnerKey,
                                            ObjectID: result.SendDefinitionList.ObjectID,
                                            List: {
                                                PartnerKey: result.SendDefinitionList.PartnerKey,
                                                ID: result.SendDefinitionList.ID,
                                                ObjectID: result.SendDefinitionList.ObjectID,
                                            },
                                            SendDefinitionListType: result.SendDefinitionList.SendDefinitionListType,
                                            CustomObjectID: result.SendDefinitionList.CustomObjectID,
                                            DataSourceTypeID: result.SendDefinitionList.DataSourceTypeID,
                                            IsTestObject: result.SendDefinitionList.IsTestObject,
                                            SalesForceObjectID: result.SendDefinitionList.SalesForceObjectID,
                                            Name: result.SendDefinitionList.Name,
                                        },
                                        Email: {
                                            ID: result.Email.ID,
                                            bldrId: emailBldrId,
                                        },
                                        BccEmail: result.BccEmail,
                                        AutoBccEmail: result.AutoBccEmail,
                                        TestEmailAddr: result.TestEmailAddr,
                                        EmailSubject: result.EmailSubject,
                                        DynamicEmailSubject: result.DynamicEmailSubject,
                                        IsMultipart: result.IsMultipart,
                                        IsWrapped: result.IsWrapped,
                                        DeduplicateByEmail: result.DeduplicateByEmail,
                                        ExclusionFilter: result.ExclusionFilter,
                                        Additional: result.Additional,
                                        CCEmail: result.CCEmail,

                                        assetType,
                                    };
                                } else {
                                    stepActivity = await this.rest.get(
                                        `/automation/v1/${assetType.api}/${activityObjectId}`
                                    );

                                    stepActivity.assetType = assetType;

                                    // Filter Activities have a sub-activity definition to get the actual filter info
                                    if (assetType.name === 'filteractivity') {
                                        const activityDefinitionId = stepActivity.filterDefinitionId;
                                        const filterDefinition = await this.rest.get(
                                            `/automation/v1/filterdefinitions/${activityDefinitionId}`
                                        );

                                        if (filterDefinition) stepActivity.filterDefinition = filterDefinition;
                                    }
                                }

                                activities.push(stepActivity);
                            }
                        }
                    }
                }
            }
        }

        return activities;
    }

    async getAutomationActivity(assetType, activityObjectId) {
        try {
            const resp = await this.rest.get(`/automation/v1/${assetType}/${activityObjectId}`);

            if (Object.prototype.hasOwnProperty.call(resp, 'errors')) {
                throw new Error(resp.errors[0].message);
            }

            return resp;
        } catch (err) {
            return {
                status: err.response.status,
                statusText: err.response.statusText,
            };
        }
    }

    async patchAsset(asset) {
        try {
            const soapObjects = ['userinitiatedsend'];
            const assetType = asset && asset.assetType;

            if (soapObjects.includes(assetType.name)) {
                const soapObj = assetType.api;
                const resp = await this.soap.update(soapObj, asset, {});

                if (resp && resp.Results && resp.Results[0].StatusCode !== 'OK')
                    throw new Error(resp.Results[0].StatusMessage);

                return resp;
            } else {
                delete asset.assetType;
                delete asset.validatedQueryText;
                delete asset.bldrId;

                const objectKey = assetType.objectIdKey;
                const object_id = asset[objectKey];

                if (!object_id) {
                    throw new Error('Definition Id is required');
                }

                const resp = await this.rest.patch(`/automation/v1/${assetType.api}/${object_id}`, asset);

                return resp;
            }
        } catch (err) {
            console.log(err);
            return {
                status: err.response.status,
                statusText: err.response.statusText,
            };
        }
    }

    async postAsset(asset) {
        try {
            const assetType = asset.assetType;
            delete asset.assetType;
            delete asset.bldrId;

            const resp = await this.rest.post(`/automation/v1/${assetType}`, asset);

            return resp;
        } catch (err) {
            console.log(err);
            return {
                status: err.response.status,
                statusText: err.response.statusText,
            };
        }
    }

    async search(searchKey, searchTerm) {
        try {
            return this.soap.retrieveBulk('Program', automationDefinition, {
                filter: {
                    leftOperand: searchKey,
                    operator: 'like',
                    rightOperand: searchTerm,
                },
            });
        } catch (err) {
            console.log(err);
        }
    }

    async searchActivity(searchActivity, searchTerm) {
        try {
            return this.rest.get(`/automation/v1/${searchActivity}?$filter=name='${searchTerm}'`);
        } catch (err) {
            console.log(err);
        }
    }
};
