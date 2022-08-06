import { User_BLDR_Config } from '../../_bldr/_processes/_userProcesses/bldr_config';
import { readFile } from 'fs/promises';
import { assignObject } from '../../_bldr/_utils';
import { state_conf } from '../../_bldr_sdk/store';
import { createFile } from '../fileSystem';
import isEqual from 'lodash.isequal';
import fs from 'fs';

import { fileExists, getRootPath } from '../fileSystem';
import { displayLine } from '../display';

const { updateFilesFromConfiguration } = new User_BLDR_Config();

enum ObjectIdKeys {
    ssjsActivityId,
}

//TODO try to make context enum type, was getting caught up on instanceDetails
const updateManifest = async (
    context: string,
    content: {
        assets?: object[];
        folders?: object[];
    }
) => {
    if (typeof content !== 'object') {
        throw new Error('Content needs to be an object');
    }

    if (!context) {
        throw new Error('Context is required');
    }

    const rootPath = await getRootPath();
    const manifestPath = rootPath ? `${rootPath}.local.manifest.json` : `./.local.manifest.json`;

    if (!fileExists(manifestPath)) {
        const init = {};
        const state = assignObject(state_conf.get());

        if (state) {
            await createFile(
                manifestPath,
                JSON.stringify(
                    {
                        instanceDetails: state,
                    },
                    null,
                    2
                )
            );
        }

        await updateManifest(context, content);
        return;
    }

    // Read ManifestJSON file from root dir
    let manifestFile: any = await readFile(manifestPath);
    let manifestJSON = JSON.parse(manifestFile);

    // Siloed write for instance details
    if (context === 'instanceDetails' && !Object.prototype.hasOwnProperty.call(manifestJSON, context)) {
        manifestJSON[context] = content;
        fs.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2));
        return;
    }

    // Iterate through content object
    // Asset Types => asset/folder
    for (const assetType in content) {
        if (
            Object.prototype.hasOwnProperty.call(manifestJSON, context) &&
            Object.prototype.hasOwnProperty.call(manifestJSON[context], assetType)
        ) {
            // @ts-ignore
            const manifestContextObject = manifestJSON[context];

            const AssetTypeItems: {
                id: number;
                assetType?: {
                    objectIdKey: ObjectIdKeys;
                };
                // @ts-ignore
            }[] = content[assetType];

            for (const i in AssetTypeItems) {
                const updateItem = AssetTypeItems[i];
                let itemId: number | string | undefined;

                // Content Builder assets should have have item.id
                // Automation Studio assets get an assetType object with the key for their ID
                if (Object.prototype.hasOwnProperty.call(updateItem, 'id')) {
                    itemId = updateItem.id;
                } else {
                    if (Object.prototype.hasOwnProperty.call(updateItem, 'assetType')) {
                        const objectIdKey = updateItem && updateItem.assetType && updateItem.assetType.objectIdKey;
                        itemId =
                            objectIdKey &&
                            Object.prototype.hasOwnProperty.call(updateItem, objectIdKey) &&
                            updateItem[objectIdKey];
                    }
                }

                let manifestContextItems: {
                    id: number;
                }[] = manifestContextObject[assetType];

                const manifestObj = manifestContextItems.find(({ id }) => id === itemId);

                // If the item is not found based on the ID add it to the Context Items Array
                // If the item is found check that the items are equal
                if (typeof manifestObj === 'undefined') {
                    manifestContextItems = [...manifestContextItems, updateItem];
                } else {
                    if (!isEqual(updateItem, manifestObj)) {
                        const updateIndex = manifestContextItems.findIndex(({ id }) => id === updateItem.id);
                        manifestContextItems[updateIndex] = updateItem;
                    }
                }
                manifestJSON[context][assetType] = manifestContextItems;
            }
        } else {
            if (!manifestJSON[context]) {
                manifestJSON[context] = {};
            }
            // @ts-ignore
            const assetObjects: object[] = content[assetType];
            // @ts-ignore
            manifestJSON[context][assetType] = [...assetObjects];
        }
    }

    let manifestStr = JSON.stringify(manifestJSON);
    let updatedManifest = JSON.parse(await updateFilesFromConfiguration(manifestStr));

    await fs.writeFileSync(manifestPath, JSON.stringify(updatedManifest, null, 2));
};

export { updateManifest };
