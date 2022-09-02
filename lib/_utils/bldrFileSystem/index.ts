import { getRootPath, fileExists, appendFile } from '../fileSystem';
import { createFile } from '../fileSystem';
import fs from 'fs';
const fsPromises = require('fs').promises;

/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const readBldrSfmcEnv = async () => {
    const rootPath = await getRootPath();
    if (fileExists(`${rootPath}.sfmc.env.json`)) {
        const config = fs.readFileSync(`${rootPath}.sfmc.env.json`);
        return JSON.parse(config.toString());
    }
};

const createEnv = async (config = null, template = true) => {
    const configTemplate = config || {
        client_id: '',
        client_secret: '',
        authentication_uri: '',
        parentMID: '',
    };

    const dirPath = await getRootPath();
    await createFile(
        `${dirPath}.sfmc.env.json`,
        JSON.stringify(configTemplate, null, 2)
    );

    if (template) {
        await createFile(
            `${dirPath}template.sfmc.env.json`,
            JSON.stringify(configTemplate, null, 2)
        );
    }

    if (fileExists(`${dirPath}.gitignore`)) {
        await appendFile(
            `${dirPath}.gitignore`,
            `\n#sfmc env \n.sfmc.env.json`
        );
    } else {
        await createFile(
            `${dirPath}.gitignore`,
            `\n#sfmc env \n.sfmc.env.json`
        );
    }
};



const scrubBldrSfmcEnv = async (content: string) => {
    const dirPath = await getRootPath();

    if (fileExists(`${dirPath}.sfmc.env.json`)) {
        const config = await readBldrSfmcEnv();

        for (const c in config) {
            const key = c;
            const value = config[c];
            if (value !=="" && content.match(value)) {
                content = content.replace(value, `{{${key}}}`);
            }
        }
    }

    return content;
};

const replaceBldrSfmcEnv = async (content: string) => {
    const dirPath = await getRootPath();
    if (fileExists(`${dirPath}.sfmc.env.json`)) {
        const config = await readBldrSfmcEnv();

        for (const c in config) {
            const key = c;
            const value = config[c];
            if (content.match(key)) {
                content = value && value !== "" && content.replace(`{{${key}}}`, value) || content;
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
    readBldrSfmcEnv,
    replaceBldrSfmcEnv,
    scrubBldrSfmcEnv,
    createEnv,
    readManifest,
    readPackageManifest,
    createAllDirectories,
    createDirectory
};
