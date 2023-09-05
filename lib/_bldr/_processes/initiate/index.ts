import fs from 'fs';
import yargsInteractive from 'yargs-interactive';
import {
    createAllDirectories,
    createEnv,
    readManifest,
    readPackageManifest,
    scrubBldrSfmcEnv,
} from '../../../_utils/bldrFileSystem';
import { updateManifest } from '../../../_utils/bldrFileSystem/manifestJSON';
import { displayLine } from '../../../_utils/display';
import { createFile, fileExists, getAllFiles, getRootPath } from '../../../_utils/fileSystem';
import { incrementMetric } from '../../../_utils/metrics';
import { isDirEmpty, isWindows } from '../../_utils';
import { State } from '../state';
import path from 'path';
const contentBuilderInitiate = require('../../../_utils/options/projectInitiate_contentBuilder');
const dataExtensionInitiate = require('../../../_utils/options/projectInitiate_dataExtension');
const { isVerbose, allowTracking, debug } = new State();

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
export class Initiate {
    constructor() {}

    updateKeys = async () => {
        try {
            const rootPath = await getRootPath();
            const ctxFiles = await getAllFiles();

            for (const c in ctxFiles) {
                const filePath = ctxFiles[c];
                let content = fs.readFileSync(filePath).toString();
                content = await scrubBldrSfmcEnv(content);
                fs.writeFileSync(filePath, content);
            }

            const manifestJSON = await readManifest();
            let manifestStr = JSON.stringify(manifestJSON);
            let updatedManifest = JSON.parse(await scrubBldrSfmcEnv(manifestStr));

            fs.writeFileSync(path.join(`${rootPath}.local.manifest.json`), JSON.stringify(updatedManifest, null, 2));

            if (await fileExists(`${rootPath}package.manifest.json`)) {
                const pkgJSON = readPackageManifest();
                let pkgStr = JSON.stringify(pkgJSON);
                let updatedPkg = JSON.parse(await scrubBldrSfmcEnv(pkgStr));
                fs.writeFileSync(`${rootPath}package.manifest.json`, JSON.stringify(updatedPkg, null, 2));
            }
        } catch (err: any) {
            debug('Update Keys Err', 'error', err);
        }
    };

    envOnly = () => {
        return createEnv();
    };

    initiateContentBuilderProject = async () => {
        const isWin = await isWindows();
        const slash = isWin ? '\\' : '/';
        const rootPath = await getRootPath();
        const dirExists = await fileExists(`${rootPath}Content Builder`);
        const dirEmpty = dirExists && (await isDirEmpty(`${rootPath}Content Builder`));

        if (!dirExists || dirEmpty) {
            yargsInteractive()
                .usage('$bldr init [args]')
                .interactive(contentBuilderInitiate)
                .then(async (initResults) => {
                    const folderPaths = [
                        {
                            folderPath: `Content Builder/${initResults.projectName}`,
                        },
                    ];

                    // Create empty directories
                    await createAllDirectories(folderPaths);

                    // Update ManifestJSON file with responses
                    await updateManifest('contentBuilder', { folders: [], assets: [] });

                    if (initResults.createConfig) {
                        await createEnv();
                    }
                });

            allowTracking() && incrementMetric('req_project_initiates_contentBuilder');
        } else {
            displayLine(`Root directory must be empty`, 'info');
        }
    };

    initiateDataExtension = async () => {
        yargsInteractive()
            .usage('$bldr init [args]')
            .interactive(dataExtensionInitiate)
            .then(async (initResults) => {
                const context = initResults.sharedDataExtension ? 'sharedDataExtension' : 'dataExtension';
                const rootFolder = initResults.sharedDataExtension ? 'Shared Data Extensions' : 'Data Extensions';
                const initFolderPath = initResults.dataExtensionPath
                    ? `${rootFolder}/${initResults.dataExtensionPath}`
                    : rootFolder;
                const folderPaths = [
                    {
                        folderPath: initFolderPath,
                    },
                ];

                // Create empty directories
                await createAllDirectories(folderPaths);
                // Update ManifestJSON file with responses

                await updateManifest(context, { folders: [], assets: [] });

                const dataExtensionInit: {
                    name: string;
                    customerKey: string;
                    description: string;
                    category: {
                        folderPath: string;
                    };
                    fields: {
                        name: string;
                        defaultValue: string;
                        fieldType: string;
                        maxLength: string;
                        isRequired: Boolean;
                        isPrimaryKey: Boolean;
                    }[];
                    isSendable?: Boolean;
                    sendableDataExtensionField?: {
                        name: string;
                        fieldType: string;
                    };
                    sendableSubscriberField?: {
                        name: string;
                    };
                    dataRetentionPeriodLength?: number;
                    dataRetentionPeriod?: string;
                    rowBasedRetention?: Boolean;
                    resetRetentionPeriodOnImport?: Boolean;
                    deleteAtEndOfRetentionPeriod?: Boolean;
                } = {
                    name: initResults.dataExtensionName,
                    customerKey: initResults.dataExtensionName,
                    description: '',
                    fields: [
                        {
                            name: 'Your Field Name',
                            defaultValue: '',
                            isRequired: false,
                            isPrimaryKey: false,
                            fieldType: 'Text | Number | Date | Boolean | EmailAddress | Phone | Decimal | Locale',
                            maxLength: '4000 | {{ Required for Primary Key Field }}',
                        },
                    ],
                    category: {
                        folderPath: initFolderPath,
                    },
                };

                if (initResults.sendableDataExtension) {
                    dataExtensionInit.isSendable = true;
                    dataExtensionInit.sendableDataExtensionField = {
                        name: '{{ name of field to use in sendable relationship }}',
                        fieldType: '{{ field type of field to use in sendable relationship }}',
                    };
                    dataExtensionInit.sendableSubscriberField = {
                        name: 'Subscriber Key',
                    };
                }

                if (initResults.retentionPeriod !== 'None') {
                    switch (initResults.retentionPeriod) {
                        case 'Individual Records':
                            dataExtensionInit.dataRetentionPeriodLength = 6;
                            dataExtensionInit.dataRetentionPeriod = 'Days | Weeks | Months | Years';
                            dataExtensionInit.rowBasedRetention = true;
                            break;

                        case 'All Records and Data Extension':
                            dataExtensionInit.dataRetentionPeriodLength = 6;
                            dataExtensionInit.dataRetentionPeriod = 'Days | Weeks | Months | Years';
                            dataExtensionInit.rowBasedRetention = false;
                            dataExtensionInit.resetRetentionPeriodOnImport = true;
                            break;

                        case 'All Records':
                            dataExtensionInit.rowBasedRetention = false;
                            dataExtensionInit.deleteAtEndOfRetentionPeriod = true;
                            break;
                    }
                }

                await createFile(`${initFolderPath}/${initResults.dataExtensionName}.json`, dataExtensionInit);
                allowTracking() && incrementMetric('req_project_initiates_dataExtension');
            });
    };
}
