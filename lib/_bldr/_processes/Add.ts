const sfmcContext: { sfmc_context_mapping: { name: string }[] } = require("@basetime/bldr-sfmc-sdk/dist/sfmc/utils/sfmcContextMapping")
const getFiles = require('node-recursive-directory');
import { readFile } from 'fs/promises';
import { StashItem } from '../../_types/StashItem';
import yargsInteractive from 'yargs-interactive'
import { State } from '../_processes/State'
import { displayLine, displayObject, displayArrayOfStrings } from '../../_utils/display'
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client'
import { InstanceConfiguration } from '../../_types/InstanceConfiguration'
import { Argv } from '../../_types/Argv'

import { getRootPath, fileExists } from '../../_utils/fileSystem'
import { SFMC_Content_Builder_Asset } from '@basetime/bldr-sfmc-sdk/lib/sfmc/types/objects/sfmc_content_builder_assets';

const {
  getState
} = new State()


/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
export class Add {
  constructor() { }
  /**
    * Method to gather all files in CWD and add to the temp Stash
    * Prepares JSON for POST/PUT to SFMC APIs
    * Will add all files starting at the CWD request was made, including all files in subfolders
    */
  addAllFiles = async () => {
    try {
      const stateObject = getState();
      const instance = stateObject && stateObject.instance;

      // Get the root directory for the project being worked on
      const rootPath = await getRootPath() || './';
      // Get the current working directory that the [add] command was triggered
      const cwdPath = process.cwd();

      // Identify the context for request
      const contextsArr = sfmcContext.sfmc_context_mapping.map(
        (context) => fileExists(`./${context.name}`) && context.name
      );

      // Isolate context from Array
      const contexts = contextsArr
        .filter((ctx) => ctx !== 'Data Extensions')
        .filter(Boolean);

      // Store all complete file paths for files in CWD and subdirectories
      let contextFiles = new Array();

      // if dir is root folder
      if (rootPath === './') {
        // iterate all contexts and add files
        for (const c in contexts) {
          contextFiles.push(...(await getFiles(`./${contexts[c]}`)));
        }
      } else {
        // get files from current working directory and subdirectories
        contextFiles.push(...(await getFiles(`${cwdPath}`)));
      }

      // Gather all file content/details for each file path
      // Separate out existing files and newly created files
      // Add existing files to the Stash with the updated file content
      const newFiles = await this.gatherAllFiles(contextFiles, rootPath);

      // // Pass isolated new files into a flow to configure asset types prior to being added to the Stash
      // await this._setNewAssets(
      //     newFiles.postFileOptions,
      //     newFiles.postFiles,
      //     instance,
      //     dirPath
      // );

      // const stashArr = await this.stash._getStashArr();

      // if (stashArr.length > 0) {
      //     // After all processing, prompt status
      //     await this.stash.status();
      // }
    } catch (err) {
      console.log(err);
    }
  }
  /**
     * Compiles all
     *
     * @param {object} ctxFiles array of file paths to gather
     * @param {string} dirPath project root folder
     * @returns {object} of new file configuration options
     */
  gatherAllFiles = async (contextFiles: string[], rootPath: string) => {
    let bldrObj;

    // Get manifest JSON file
    const manifestPath = rootPath
      ? `${rootPath}.local.manifest.json`
      : `./.local.manifest.json`;
    // Read ManifestJSON file from root dir
    const manifestFile: any = await readFile(manifestPath);
    const manifestJSON = JSON.parse(manifestFile);

    // Store all complete objects for Stash
    const postFiles = new Array();

    // Initiate configuration for new file prompts
    let postFileOptions = {
      interactive: { default: true },
    };

    const availableContexts = Object.keys(manifestJSON)
    for (const context in availableContexts) {
      const manifestContextAssets: {
        name: string;
        category: {
          folderPath: string;
        }
      }[] = manifestJSON[availableContexts[context]] && manifestJSON[availableContexts[context]]['assets']

      if (manifestContextAssets) {
        // Iterate through files array to check if existing files
        for (const path in contextFiles) {
          const systemFilePath = contextFiles[path];
          // const manifestPaths = manifestContextAssets.map((asset: {category: {folderPath: string}}) => asset && asset.category && asset.category.folderPath)

          const existingAssets = manifestContextAssets.find((asset) => {
            const folderPath = asset && asset.category && asset.category.folderPath;
            const splitSystemFilePath = systemFilePath.split('/');
            let fileName = splitSystemFilePath[splitSystemFilePath.length - 1]
            fileName = fileName.substring(0, fileName.indexOf('.'))

            console.log(systemFilePath)
            console.log(fileName)
            console.log(folderPath)
            return systemFilePath.includes(folderPath) && fileName === asset.name && asset;
          });

          // Set Boolean for logic based on filter
          // const manifestCheck = existsInManifest.length === 0 ? false : true;

          console.log(existingAssets)
          // if (manifestCheck) {
          //   // If the file exists add bldrJSON data and path to the stash to prep push command
          //   bldrObj = {
          //     path: ctxFile,
          //     bldr: bldrFilter[0],
          //   };
          // }
        }
      }
    }
    // Iterate through files array to check if existing files
    // for (const path in contextFiles) {
    //   const systemFilePath = contextFiles[path];
    //   const manifestContextPaths = manifestJSON

    // // Check bldrJSON file if there is a match based on compiled folder paths
    // const bldrFilter = bldrJSON.filter((bldr) => {
    //   return ctxFile.includes(bldr.folderPath) ? true : false;
    // });

    // // Set Boolean for logic based on filter
    // const checkBldr = bldrFilter.length === 0 ? false : true;

    // if (checkBldr) {
    //   // If the file exists add bldrJSON data and path to the stash to prep push command
    //   bldrObj = {
    //     path: ctxFile,
    //     bldr: bldrFilter[0],
    //   };

    //   // Set compiled object as a Stash Object
    //   await this.stash._setStashObj(ctxFile, bldrObj, false);
    // } else {
    //   if (ctxFile.includes('Automation Studio')) {
    //     console.log(
    //       'Creating new assets in Automation Studio is in progress!'
    //     );
    //   } else {
    //     const bldrId = utils.guid();

    //     // Get context based on folder path
    //     const ctx = utils.ctx(ctxFile);

    //     // Set folder path (from context root) based on context
    //     const folderPath = ctxFile.substring(
    //       ctxFile.indexOf(ctx.root)
    //     );

    //     // Initaite bldr object for new file POST
    //     bldrObj = {
    //       path: ctxFile,
    //       create: true,
    //       bldr: {
    //         context: ctx.context,
    //         bldrId,
    //         folderPath,
    //       },
    //     };

    //     // Add bldrObj to files tobe posted and set new file options
    //     postFiles.push(bldrObj);

    //     // Set key for new file to the provided bldrId
    //     postFileOptions[bldrId] = {
    //       type: 'list',
    //       describe: `What type of asset is ${folderPath}`,
    //       choices: [
    //         'htmlemail',
    //         'codesnippetblock',
    //         'htmlblock',
    //         'dataextension',
    //       ],
    //       prompt: 'always',
    // };
    // }
    // }
    // }

    // return {
    //   postFileOptions,
    //   postFiles,
    // };
  }
};
