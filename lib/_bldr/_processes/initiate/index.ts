
import { Argv } from "../../../_types/Argv";
import { createFile, fileExists, getAllFiles, getRootPath } from "../../../_utils/fileSystem";
import { createAllDirectories, createAPIConfig, readManifest, readPackageManifest, replaceBldrSfmcConfig, scrubBldrSfmcConfig } from "../../../_utils/bldrFileSystem";
import axios from 'axios';
import fs from 'fs'
import yargsInteractive from "yargs-interactive";
import { updateManifest } from "../../../_utils/bldrFileSystem/manifestJSON";
import { displayLine } from "../../../_utils/display";
const contentBuilderInitiate = require('../../../_utils/options/projectInitiate_contentBuilder')

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
export class Initiate {
    constructor() {
    }

    updateKeys = async () => {
        try {
            const rootPath = await getRootPath;
            const ctxFiles = await getAllFiles();

            for (const c in ctxFiles) {
                const filePath = ctxFiles[c];
                let content = fs.readFileSync(filePath).toString();
                content = await scrubBldrSfmcConfig(content);
                fs.writeFileSync(filePath, content);
            }

            const manifestJSON = await readManifest();
            let manifestStr = JSON.stringify(manifestJSON);
            let updatedManifest = JSON.parse(
                await scrubBldrSfmcConfig(manifestStr)
            );


            fs.writeFileSync(
                `./.local.manifest.json`,
                JSON.stringify(updatedManifest, null, 2)
            );

            if (
                await fileExists(`${rootPath}.package.manifest.json`)
            ) {
                const pkgJSON = readPackageManifest();
                let pkgStr = JSON.stringify(pkgJSON);
                let updatedPkg = JSON.parse(await scrubBldrSfmcConfig(pkgStr));
                fs.writeFileSync(
                    `${rootPath}.package.manifest.json`,
                    JSON.stringify(updatedPkg, null, 2)
                );
            }
        } catch (err: any) {
            console.log(err.message);
        }
    }

    configOnly = () => {
        return createAPIConfig();
    }



    initiateContentBuilderProject = async () => {
        const rootPath = await getRootPath();
        const isDirEmpty = await !fileExists(
            `${rootPath}Content Builder`
        );

        if (isDirEmpty) {
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
                    await updateManifest(
                        'contentBuilder',
                        { folders: [], assets: [] }
                    );


                    if (initResults.createConfig) {
                        await createAPIConfig();
                    }
                });
        } else {
            displayLine(`Root directory must be empty`, 'info')
        }
    }
};
