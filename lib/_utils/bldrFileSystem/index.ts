import { getRootPath, fileExists } from "../fileSystem";
import fs from "fs";

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

export { readBldrSfmcConfig, readManifest };
