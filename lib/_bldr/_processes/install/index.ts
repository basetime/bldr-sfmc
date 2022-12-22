import { Argv } from '../../../_types/Argv';
import { createFile, fileExists } from '../../../_utils/fileSystem';
import { createEnv } from '../../../_utils/bldrFileSystem';
import axios from 'axios';

/**
 * Notes June 2
 * Left off replacing matchedValue references with the new bldr IDs
 * Need to work on ContentBlockByName
 * Plan out deploy flow
 */
export class Install {
    constructor() {}

    installPackage = async (argv: Argv) => {
        try {
            let pkgData: any;

            let deployURL = argv && argv._ && argv._[1];
            deployURL = deployURL?.replace(/^\/\/|^.*?:(\/\/)?/, '');

            if (deployURL && deployURL.includes('github')) {
                pkgData = await this.githubJSON(deployURL);
            }

            if (pkgData && pkgData.status === 'Error') {
                throw new Error(pkgData.statusText);
            }

            if (Object.prototype.hasOwnProperty.call(pkgData.package, 'sfmcEnv')) {
                await createEnv(pkgData.package.sfmcEnv, true);
            }

            if (Object.prototype.hasOwnProperty.call(pkgData, 'readme')) {
                await createFile('./README.md', pkgData.readme);
            }

            await createFile(`./package.manifest.json`, JSON.stringify(pkgData.package, null, 2));
        } catch (err: any) {
            console.log(err.message);
        }
    };

    githubJSON = async (deployURL: string) => {
        try {
            //process github
            let readmeData;

            const deployArray = deployURL.split('/');
            const owner = deployArray[1];
            const repo =
                deployArray[2].indexOf('.') === -1
                    ? deployArray[2]
                    : deployArray[2].substring(0, deployArray[2].indexOf('.'));
            const getRepository = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/`);

            if (!getRepository) {
                throw new Error('Repository not found.');
            }

            const packageJSON = getRepository.data.find(
                (file: { name: string }) => file.name === 'package.manifest.json'
            );

            const readme = getRepository.data.find((file: { name: string }) => file.name === 'README.md');

            if (readme) {
                const readmeRequest = await axios.get(readme.download_url);
                readmeData = readmeRequest.data;
            }

            if (!packageJSON) {
                throw new Error('package.manifest.json not found');
            } else {
                const getPackageJSON = await axios.get(packageJSON.download_url);

                return {
                    package: getPackageJSON.data,
                    readme: readmeData,
                };
            }
        } catch (err: any) {
            console.log(err.message);
        }
    };
}
