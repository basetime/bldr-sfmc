import { getRootPath, fileExists } from '../../../_utils/fileSystem';
import { readManifest, readBldrSfmcEnv, readPackageManifest, readBldrSfmcEnvTemplate } from '../../../_utils/bldrFileSystem/'
import { package_new } from '../../../_utils/options/package_new';
// const packageReference = require('../packageReference');
// const coreConfigurationOptions = require('../options');
import { setContentBuilderPackageAssets } from '../../_processes/_contexts/contentBuilder/package'
import yargsInteractive from 'yargs-interactive';
import { createFile } from '../../../_utils/fileSystem';
import { create } from 'lodash';
import { initiateBldrSDK } from '../../../_bldr_sdk';
import { createEditableFilesBasedOnContext } from '../../../_utils/bldrFileSystem/_context/CreateFilesBasedOnContext';
import { displayLine } from '../../../_utils/display';
import { assignObject, uniqueArrayByKey } from '../../_utils';

/**
 */
export class Package {
    constructor() { }

    packageConfig = async () => {
        try {
            const dirPath = await getRootPath();
            if (!fileExists(`${dirPath}.local.manifest.json`)) {
                throw new Error(
                    'Please run [ bldr init ] or clone SFMC assets before running [ bldr package ]'
                );
            }

            let manifestJSON = await readManifest();
            const existingPkg = await readPackageManifest()
            await yargsInteractive()
                .usage('$0 <command> [args]')
                .interactive(await package_new(existingPkg))
                .then(async (initResults: {
                    name?: string;
                    packageVersion?: string;
                    repository?: string;
                    description?: string;
                    tags?: string;
                }) => {
                    try {
                        const sdk = await initiateBldrSDK();
                        let packageOut: {
                            name?: string;
                            version?: string;
                            repository?: string;
                            description?: string;
                            tags?: string[];
                            sfmcEnv?: any;
                            contentBuilder?: any;
                            dataExtension?: any;
                            automationStudio?: any;
                        } = {};

                        packageOut.name = initResults.name;
                        packageOut.version = initResults.packageVersion;
                        packageOut.repository = initResults.repository;
                        packageOut.description = initResults.description;

                        const tagsSplit = initResults.tags && initResults.tags.split(',') || [];
                        const tagsArray = tagsSplit?.map((tag) => tag.trim()) || [];
                        packageOut.tags = tagsArray;

                        const sfmcEnv = await readBldrSfmcEnvTemplate() || null;

                        if (sfmcEnv) {
                            packageOut['sfmcEnv'] = sfmcEnv;
                        }

                        const availableContexts = Object.keys(manifestJSON)
                        availableContexts.shift()

                        for (const c in availableContexts) {
                            const context = availableContexts[c];
                            manifestJSON = await readManifest();
                            const contextAssets = manifestJSON[context]['assets']

                            switch (context) {
                                case "contentBuilder":
                                    displayLine(`Gathering Dependencies for ${contextAssets.length} Assets`, 'info')
                                    await sdk.cli.contentBuilder.setContentBuilderPackageAssets(packageOut, contextAssets)

                                    const gatherDependencies = await sdk.cli.contentBuilder.setContentBuilderDependenciesFromPackage(packageOut)
                                    const newDependencies = gatherDependencies && gatherDependencies.newDependencies && Object.keys(gatherDependencies.newDependencies) || []
                                    const newContextKeys = newDependencies && Object.keys(newDependencies) || []

                                    newContextKeys && newContextKeys.length && displayLine(`Creating files for ${newContextKeys.join(', ')}`, 'info')

                                    for (const k in newContextKeys) {
                                        displayLine(`Working on ${newContextKeys[k]}`, 'progress')
                                        let newAssets = newDependencies[newContextKeys[k]]['assets']
                                        await createEditableFilesBasedOnContext(newContextKeys[k], newAssets)
                                    }

                                    break;

                                case "dataExtension":
                                    const dataExtensionPkgAssets = existingPkg && existingPkg[context] && existingPkg[context]['assets'] ? await uniqueArrayByKey([...existingPkg.dataExtension.assets, ...contextAssets], 'customerKey') : contextAssets;

                                    dataExtensionPkgAssets && dataExtensionPkgAssets.forEach((de: {
                                        customerKey?: string;
                                    }) => {
                                        delete de.customerKey
                                    })

                                    packageOut.dataExtension = {
                                        assets: dataExtensionPkgAssets
                                    }
                                    break;
                            }
                        }

                        packageOut?.contentBuilder?.assets.forEach((asset: {
                            id?: number;
                            exists?: Boolean;
                        }) => {
                            delete asset.id
                            delete asset.exists
                        })

                        packageOut?.dataExtension?.assets.forEach((asset: {
                            category: {
                                categoryId?: number
                            }
                        }) => {
                            delete asset.category.categoryId
                        })

                        await createFile('./.package.manifest.json', JSON.stringify(packageOut, null, 2))

                    } catch (err) {
                        console.log(err)
                    }

                })
        } catch (err) {
            console.log(err)
        }
    }
}
