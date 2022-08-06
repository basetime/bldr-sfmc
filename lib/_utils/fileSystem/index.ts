//TODO figure out why sfmc_context_mapping is returning module not found
// import { sfmc_context_mapping } from '@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping'
const sfmcContext: {
    sfmc_context_mapping: { name: string }[];
} = require('@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping');
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';

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
const createFile = async (filePath: string, content: string) => {
    const dirPathArr = filePath.split('/');
    dirPathArr.pop();
    const directoryPath = dirPathArr.join('/');

    if (typeof content === 'object') {
        content = JSON.stringify(content, null, 2);
    }

    fs.writeFile(filePath, content, 'utf8', async (err) => {
        if (err) {
            await createDirectory(directoryPath);
            await createFile(filePath, content);
        }
    });
};

export { getRootPath, fileExists, createFile, createDirectory };
