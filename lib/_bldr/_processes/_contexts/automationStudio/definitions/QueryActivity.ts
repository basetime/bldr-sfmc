import { number } from "yargs";

const { MappingByActivityType } = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/automationActivities')

const setQueryActivity = async (asset: {
    queryDefinitionId?: string;
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
  updatedContent: string) => {

    const assetType = await MappingByActivityType(asset.assetType.name)

    let returnObject: {
        key?: string;
        queryDefinitionId?: string;
        name: string;
        description: string;
        categoryId: number;
        queryText: string;
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
        queryText: updatedContent,
        assetType,
    };

    if(asset.key){
        returnObject.key = asset.key;
    }

    if(asset.queryDefinitionId){
        returnObject.queryDefinitionId = asset.queryDefinitionId;
    }

    console.log('returnObject', returnObject)
    return returnObject
};

export {
    setQueryActivity
}
