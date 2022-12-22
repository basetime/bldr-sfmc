import { number } from 'yargs';

import { MappingByActivityType } from '../../../../../_utils/bldrFileSystem/_context/automationStudio/automationActivities';

const setScriptActivity = async (
    asset: {
        ssjsActivityId?: string;
        name: string;
        key?: string;
        description: string;
        script: string;
        categoryId: number;
        status: string;
        assetType: {
            api: string;
            name: string;
            objectIdKey: string;
            folder: string;
        };
        category: { folderPath: string };
        bldrId: string;
    },
    updatedContent: string
) => {
    const assetType = await MappingByActivityType(asset.assetType.name);
    if (assetType) {
        let returnObject: {
            key?: string;
            ssjsActivityId?: string;
            name: string;
            description: string;
            categoryId: number;
            script: string;
            assetType: {
                objectTypeId: number;
                api: string;
                name: string;
                objectIdKey: string;
                folder: string;
            };
        } = {
            name: asset.name,
            description: asset.description,
            categoryId: asset.categoryId,
            script: updatedContent,
            assetType,
        };

        if (asset.key) {
            returnObject.key = asset.key;
        }

        if (asset.ssjsActivityId) {
            returnObject.ssjsActivityId = asset.ssjsActivityId;
        }

        return returnObject;
    }
};

export { setScriptActivity };
