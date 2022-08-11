import { setScriptActivity } from "./ScriptActivity";

const setAutomationStudioDefinition = async (sfmcUpdateObject: {
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
    },
    category: { folderPath: string; },
    bldrId: string
},
    stashFileObject?: {
        fileContent?: string;
    }) => {
    const assetType = sfmcUpdateObject.assetType.name;
    let assetOutput;

    switch (assetType) {
        case 'ssjsactivity':
            assetOutput = setScriptActivity(sfmcUpdateObject)
            break;
        // case 'htmlblock':
        // case 'codesnippetblock':
        //     assetOutput = stashFileObject?.fileContent && SetContentBlock(sfmcUpdateObject, stashFileObject.fileContent);
        //     break;
    }
    return assetOutput
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
