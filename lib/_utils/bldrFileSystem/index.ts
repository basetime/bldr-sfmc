import { getRootPath, fileExists } from "../fileSystem";
import fs from "fs"

const readBldrSfmcConfig = async () => { 
  const rootPath = await getRootPath()
  if (fileExists(`${rootPath}.sfmc.config.json`)) {
      const config = fs.readFileSync(`${rootPath}.sfmc.config.json`);
      return JSON.parse(config.toString());
  }
}

export {
  readBldrSfmcConfig
}