import { getRootPath, fileExists, appendFile } from '../fileSystem';
import { createFile } from '../fileSystem';
import fs from 'fs';
const fsPromises = require('fs').promises;

/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readBldrSfmcConfig = async () => {
    const rootPath = await getRootPath();
    if (fileExists(`${rootPath}.sfmc.config.json`)) {
        const config = fs.readFileSync(`${rootPath}.sfmc.config.json`);
        return JSON.parse(config.toString());
    }
};

const createAPIConfig = async (config = null, template = true) => {
    const configTemplate = config || {
        client_id: '',
        client_secret: '',
        authentication_uri: '',
        parentMID: '',
    };

    const dirPath = await getRootPath();
    await createFile(
        `${dirPath}.sfmc.config.json`,
        JSON.stringify(configTemplate, null, 2)
    );

    if (template) {
        await createFile(
            `${dirPath}template.sfmc.config.json`,
            JSON.stringify(configTemplate, null, 2)
        );
    }

    if (fileExists(`${dirPath}.gitignore`)) {
        await appendFile(
            `${dirPath}.gitignore`,
            `\n#sfmc config \n.sfmc.config.json`
        );
    } else {
        await createFile(
            `${dirPath}.gitignore`,
            `\n#sfmc config \n.sfmc.config.json`
        );
    }
};



const scrubBldrSfmcConfig = async (content: string) => {
    const dirPath = await getRootPath();

    if (fileExists(`${dirPath}.sfmc.config.json`)) {
        const config = await readBldrSfmcConfig();

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

const replaceBldrSfmcConfig = async (content: string) => {
    const dirPath = await getRootPath();
    if (fileExists(`${dirPath}.sfmc.config.json`)) {
        const config = await readBldrSfmcConfig();

        for (const c in config) {
            const key = c;
            const value = config[c];

            if (content.match(key)) {
                content = content.replace(`{{${key}}}`, value);
            }
        }
    }

    return content;
};

/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readManifest = async () => {
    const rootPath = await getRootPath();
    if (fileExists(`${rootPath}.local.manifest.json`)) {
        const config = fs.readFileSync(`${rootPath}.local.manifest.json`);
        return JSON.parse(config.toString());
    }
};
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readPackageManifest = async () => {
    const rootPath = await getRootPath();
    if (fileExists(`${rootPath}.package.manifest.json`)) {
        const config = fs.readFileSync(`${rootPath}.package.manifest.json`);
        return JSON.parse(config.toString());
    }
};



const createAllDirectories = (folderPaths: { folderPath: string }[]) => {
    const directories = folderPaths.map(({ folderPath }) => folderPath);
    for (const f in directories) {
        const dir = directories[f];
        createDirectory(dir);
    }
}

const createDirectory = async (dir: string) => {
    try {
        await fsPromises.access(dir, fs.constants.F_OK);
    } catch (e) {
        await fsPromises.mkdir(dir, { recursive: true });
    }
}

export {
    readBldrSfmcConfig,
    replaceBldrSfmcConfig,
    scrubBldrSfmcConfig,
    createAPIConfig,
    readManifest,
    readPackageManifest,
    createAllDirectories,
    createDirectory
};
