import { number } from "yargs";

const { MappingByAssetType } = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/contentBuilderAssetTypes');

const setScriptActivity = (asset: {
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
  }) => {

    const assetType = MappingByAssetType(asset.assetType.name)

    let returnObject: {
        key?: string;
        ssjsActivityId?: string;
        name: string;
        description: string;
        categoryId: number;
        script: string;
        assetType: {
            objectTypeId: number,
            api: string;
            name: string;
            objectIdKey: string;
            folder: string;
        }
    } = {
        name: asset.name,
        description: asset.description,
        categoryId: asset.categoryId,
        script: asset.script,
        assetType,
    };

    if(asset.key){
        returnObject.key = asset.key;
    }

    if(asset.ssjsActivityId){
        returnObject.ssjsActivityId = asset.ssjsActivityId;
    }

    return returnObject
};

export {
    setScriptActivity
}
