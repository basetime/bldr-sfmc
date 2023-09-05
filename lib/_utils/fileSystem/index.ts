const sfmcContext: {
    sfmc_context_mapping: { name: string; rootName: string }[];
} = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const getFiles = require('node-recursive-directory');

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { State } from '../../_bldr/_processes/state';
import { resolvedRoot, normalizedRoot } from '../bldrFileSystem';
import { getFilePathDetails } from '../../_bldr/_utils';

const { getState, debug } = new State();

const isProjectRoot = () => {
    // Get the current working directory that the [add] command was triggered
    const cwdPath = path.resolve('./');
    return sfmcContext.sfmc_context_mapping.some(
        (context) => context.name && typeof context.name === 'string' && cwdPath.endsWith(context.name)
    );
};

/**
 *
 * @param filePath
 * @returns
 */
const fileExists = (filePath: string) => fs.existsSync(path.normalize(filePath));
/**
 *
 * @returns
 */
const getRootPath = () => {
    let root = path.resolve('./');
    let rootFolder = root.split(path.normalize('/')).pop();
    const rootArr = sfmcContext.sfmc_context_mapping.map(({ name }) => {
        if (rootFolder === name) {
            return root.split(name)[0];
        }

        const slash = path.normalize('/');
        if (root.includes(`${slash}${name}${slash}`)) {
            return root.split(name)[0];
        }
        return null;
    });

    if (rootArr.filter(Boolean)[0]) {
        return rootArr.filter(Boolean)[0];
    }

    return path.normalize('./');
};
/**
 *
 * @param directoryPath
 */
const createDirectory = async (directoryPath: string) => {
    try {
        await fsPromises.access(directoryPath, fs.constants.F_OK);
    } catch (e) {
        await fsPromises.mkdir(directoryPath, { recursive: true });
    }
};
/**
 *
 * @param filePath
 * @param content
 */
const createFile = async (filePath: string, content: any) => {
    const filePathDetails = await getFilePathDetails(filePath);
    const directoryPath = filePathDetails.dir;

    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }

    directoryPath && (await createDirectory(directoryPath));
    await fsPromises.writeFile(filePath, content);
    return await fileExists(path.join(resolvedRoot, filePath));
};
/**
 *
 * @param filePath
 * @param content
 */
const appendFile = async (filePath: string, content: string) => {
    fs.readFile(filePath, function (err, fileData) {
        if (err) throw err;
        if (!fileData.includes(content)) {
            fs.appendFile(filePath, content, function (err) {
                if (err) throw err;
            });
        }
    });
};
/**
 * Reads .sfmc.config.json file
 *
 * @returns
 */
const getBldrVersion = async () => {
    const { version } = require('../package.json');

    return version;
};

const getAllFiles = async () => {
    // // Get the root directory for the project being worked on
    // const dirPath = await getRootPath();

    // // Get the current working directory that the [add] command was triggered
    // const cwdPath = process.cwd();

    // // Identify the context for request
    // const contexts = sfmcContext.sfmc_context_mapping
    //     .map((ctx) => fileExists(path.join(resolvedRoot, ctx.rootName)) && ctx.rootName)
    //     .filter(Boolean);

    // // Store all complete file paths for files in CWD and subdirectories
    // let ctxFiles = new Array();

    // // // if dir is root folder
    // // if (isProjectRoot()) {
    // //     // iterate all contexts and add files
    // //     for (const c in contexts) {
    // //         ctxFiles.push(...(await getFiles(`./${contexts[c]}`)));
    // //     }
    // // } else {

    //       // get files from current working directory and subdirectories
    //       ctxFiles.push(...(await getFiles(path.resolve('./'))));
    // // }

    const stateObject = getState();
    const instance = stateObject && stateObject.instance;

    // Get the root directory for the project being worked on
    const rootPath = normalizedRoot;
    // Get the current working directory that the [add] command was triggered
    const cwdPath = process.cwd();

    debug('Folder Path', 'info', { cwdPath, rootPath });

    // Identify the context for request
    const contextsArray = sfmcContext.sfmc_context_mapping.map((context) => context.name);

    // Store all complete file paths for files in CWD and subdirectories
    let contextFiles: string[] = [];

    // get files from current working directory and subdirectories
    contextFiles.push(...(await getFiles(path.resolve('./'))));

    const filteredContextFiles = contextFiles
        .map((filePath) => {
            const isContextFilePath = contextsArray.some((context) => {
                return filePath.includes(context);
            });

            return (isContextFilePath && filePath) || '';
        })
        .filter(Boolean);

    return filteredContextFiles;
};

export { getRootPath, fileExists, createFile, appendFile, createDirectory, getBldrVersion, getAllFiles, isProjectRoot };
