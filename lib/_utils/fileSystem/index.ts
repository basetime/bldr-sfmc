const sfmcContext: {
    sfmc_context_mapping: { name: string; rootName: string }[];
} = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
const getFiles = require('node-recursive-directory');

import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { State } from '../../_bldr/_processes/state';

const { debug } = new State();
/**
 *
 * @param filePath
 * @returns
 */
const fileExists = (filePath: string) => fs.existsSync(filePath);
/**
 *
 * @returns
 */
const getRootPath = () => {
    const rootArr = sfmcContext.sfmc_context_mapping.map(({ name }) => {
        const dirPath = path.resolve('./');
        if (dirPath.includes(name)) {
            return dirPath.split(name)[0];
        }

        return null;
    });

    if (rootArr.filter(Boolean)[0]) {
        return rootArr.filter(Boolean)[0];
    }

    return './';
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
    const dirPathArr = filePath.split('/');
    dirPathArr.pop();
    const directoryPath = dirPathArr.join('/');

    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }

    await createDirectory(directoryPath);
    await fsPromises.writeFile(filePath, content)
    return await fileExists(`./${filePath}`)
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
    // Get the root directory for the project being worked on
    const dirPath = await getRootPath();

    // Get the current working directory that the [add] command was triggered
    const cwdPath = process.cwd();

    // Identify the context for request
    const contexts = sfmcContext.sfmc_context_mapping
        .map((ctx) => fileExists(`./${ctx.rootName}`) && ctx.rootName)
        .filter(Boolean);

    // Store all complete file paths for files in CWD and subdirectories
    let ctxFiles = new Array();

    // if dir is root folder
    if (dirPath === './') {
        // iterate all contexts and add files
        for (const c in contexts) {
            ctxFiles.push(...(await getFiles(`./${contexts[c]}`)));
        }
    } else {
        // get files from current working directory and subdirectories
        ctxFiles.push(...(await getFiles(`${cwdPath}`)));
    }

    return ctxFiles;
};

export { getRootPath, fileExists, createFile, appendFile, createDirectory, getBldrVersion, getAllFiles };
