import { fileExists, getRootPath } from '../../../_utils/fileSystem';
import { readBldrSfmcEnv } from '../../../_utils/bldrFileSystem';

export class User_BLDR_Config {
    constructor() {}

    // createAPIConfig = async (config, template = true) => {
    //   const configTemplate = config || {
    //     client_id: '',
    //     client_secret: '',
    //     authentication_uri: '',
    //     parentMID: '',
    //   };

    //   const dirPath = await localFiles._getRootPath(contextMap);
    //   localFiles.createFile(
    //     `${dirPath}.sfmc.config.json`,
    //     JSON.stringify(configTemplate, null, 2)
    //   );

    //   if (template) {
    //     localFiles.createFile(
    //       `${dirPath}template.sfmc.config.json`,
    //       JSON.stringify(configTemplate, null, 2)
    //     );
    //   }

    //   localFiles.append(
    //     `${dirPath}.gitignore`,
    //     `\n#sfmc config \n.sfmc.config.json`
    //   );
    // };

    updateFilesFromConfiguration = async (content: string) => {
        const rootPath = await getRootPath();
        if (fileExists(`${rootPath}.sfmc.config.json`)) {
            const config = await readBldrSfmcEnv();
            for (const c in config) {
                const key = c;
                const value = config[c];
                if (content.match(value)) {
                    content = content.replace(value, `{{${key}}}`);
                }
            }
        }

        return content;
    };

    // replaceConfig = async (content: string) => {
    //   const dirPath = await localFiles._getRootPath(contextMap);
    //   if (localFiles._fileExists(`${dirPath}/.sfmc.config.json`)) {
    //     const config = await localFiles._getSFMCConfig(dirPath);

    //     for (const c in config) {
    //       const key = c;
    //       const value = config[c];

    //       if (content.match(key)) {
    //         content = content.replace(`{{${key}}}`, value);
    //       }
    //     }
    //   }

    //   return content;
    // };

    // deployCheckConfig = () => {
    //   let preventDeployment = false;

    //   const dirPath = await localFiles._getRootPath(contextMap);
    //   if (localFiles._fileExists(`${dirPath}/.sfmc.config.json`)) {
    //     const config = await localFiles._getSFMCConfig(dirPath);
    //     for (const c in config) {
    //       const key = c;
    //       const value = config[c];

    //       if (value === '') {
    //         console.log(`Please configure ${key} in .sfmc.config.json`);
    //         preventDeployment = true;
    //       }
    //     }
    //   }

    //   return preventDeployment;
    // };
}
