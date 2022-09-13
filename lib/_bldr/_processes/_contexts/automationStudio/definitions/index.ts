import { setScriptActivity } from './ScriptActivity';
import { setQueryActivity } from './QueryActivity';

const setAutomationStudioDefinition = async (
    sfmcUpdateObject: {
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
    const assetType = sfmcUpdateObject.assetType.name;
    let assetOutput;

    switch (assetType) {
        case 'ssjsactivity':
            assetOutput = await setScriptActivity(sfmcUpdateObject, updatedContent);
            break;
        case 'queryactivity':
            assetOutput = await setQueryActivity(sfmcUpdateObject, updatedContent);
            break;
        default:
            assetOutput = JSON.parse(updatedContent);
    }
    return assetOutput;
};

/**
 *
 */
const updateAutomationStudioAssetContent = (asset: any, content: string) => {
    const assetType = (asset.assetType && asset.assetType.name) || null;
    switch (assetType) {
        case 'queryactivity':
            asset.queryText = content;
            break;
        case 'ssjsactivity':
            asset.script = content;
            break;
        default:
    }

    return asset;
};

export { setAutomationStudioDefinition, updateAutomationStudioAssetContent };
