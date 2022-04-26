const utils = require('../../utils');
const automationDefinition = require('./definitions/Automation');

module.exports = class Automation {
    constructor(rest, soap) {
        this.rest = rest;
        this.soap = soap;
    }

    // TODO: add auto pagination
    async getByFolderArray(folderIds) {
        try {
            const items = new Array();

            if (!Array.isArray(folderIds))
                throw new Error('folderIds argument must be an array');

            const automationIds = await this.getAutomationKeysByFolder(
                folderIds
            );
            const automations = await this.getAutomationsByKey(automationIds);
            const automationStepDefinitions =
                await this.getAutomationActivities(automations);

            items.push(...automations, ...automationStepDefinitions);

            return {
                items,
            };
        } catch (err) {
            console.log(err);
        }
    }

    async getAutomationKeysByFolder(folderIds) {
        let automations = new Array();

        for (const f in folderIds) {
            const folderId = folderIds[f];
            const autoRequest = await this.rest.get(
                `/legacy/v1/beta/automations/automation/definition/?$sort=lastRunTime desc&categoryId=${folderId}`
            );

            if (Object.prototype.hasOwnProperty.call(autoRequest, 'entry'))
                automations.push(...autoRequest.entry);
        }

        return automations.map((automation) => automation.id);
    }

    async getAutomationsByKey(automationKeys) {
        const automations = new Array();

        if (Array.isArray(automationKeys)) {
            for (const a in automationKeys) {
                const automationKey = automationKeys[a];
                const autoRequest = await this.rest.get(
                    `/automation/v1/automations/${automationKey}`
                );

                if (Object.prototype.hasOwnProperty.call(autoRequest, 'id'))
                    automations.push(autoRequest);
            }
        } else {
            //add logic
        }
        return automations;
    }

    async getAutomationActivities(automations) {
        const activities = new Array();

        if (Array.isArray(automations)) {
            for (const a in automations) {
                const automation = automations[a];

                if (Object.prototype.hasOwnProperty.call(automation, 'steps')) {
                    for (const as in automation.steps) {
                        const steps = automation.steps[as];

                        for (const sa in steps.activities) {
                            const activity = steps.activities[sa];

                            const assetType = await utils.identifyActivityType(
                                activity.objectTypeId
                            );

                            const activityObjectId = activity.activityObjectId;

                            const stepActivity = await this.rest.get(
                                `/automation/v1/${assetType.api}/${activityObjectId}`
                            );

                            stepActivity.assetType = assetType;

                            activities.push(stepActivity);
                        }
                    }
                }
            }
        }

        return activities;
    }

    async patchAsset(asset) {
        try {
            const assetType = asset.assetType;
            const objectKey = assetType.objectIdKey;
            const object_id = asset[objectKey];

            if (!object_id) throw new Error('Definition Id is required');

            delete asset.assetType;
            delete asset.validatedQueryText;
            delete asset.bldrId;

            const resp = await this.rest.patch(
                `/automation/v1/${assetType.api}/${object_id}`,
                asset
            );

            return resp;
        } catch (err) {
            console.log(err);
            return {
                status: err.response.status,
                statusText: err.response.statusText,
            };
        }
    }

    async postAsset(asset) {}

    // async getById(id) {
    //     try {
    //         if (!id) throw new Error("id argument is required");

    //         const assetResp = await this.rest.get(
    //             `/asset/v1/content/assets/${id}`
    //         );

    //         if (!assetResp) throw new Error(`No Asset Found for ${id}`);

    //         return new Array(assetResp);
    //     } catch (err) {
    //         return err;
    //     }
    // }

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

    // async postAsset(asset) {
    //     try {
    //         const resp = await this.rest.post(
    //             `/asset/v1/content/assets/`,
    //             asset
    //         );
    //         return resp;
    //     } catch (err) {
    //         console.log(JSON.stringify(err.response.data, null, 2));
    //         return {
    //             status: err.response.status,
    //             statusText: err.response.statusText,
    //         };
    //     }
    // }

    // async putAsset(asset) {
    //     try {
    //         if (!asset.id) throw new Error("Asset Id is required");

    //         const assetId = asset.id;
    //         const resp = await this.rest.put(
    //             `/asset/v1/content/assets/${assetId}`,
    //             asset
    //         );
    //         return resp;
    //     } catch (err) {
    //         console.log(err);
    //         return {
    //             status: err.response.status,
    //             statusText: err.response.statusText,
    //         };
    //     }
    // }

    // async getImageFile(id) {
    //     if (!id) throw new Error("Asset Id is required");

    //     const resp = await this.rest.get(`/asset/v1/content/assets/${id}/file`);
    //     return resp;
    // }
};
