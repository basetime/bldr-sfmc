import { Argv } from "../../../_types/Argv";
import { initiateBldrSDK } from '../../../_bldr_sdk'
import { displayLine, displayObject } from "../../../_utils/display";
import flatten from 'flat';

import { createEditableFiles } from "../../../_bldr/_processes/contentBuilder/CreateLocalFiles";

/**
 * Flag routing for Config command
 * 
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 * 
 */
const ContentBuilderSwitch = async (req: any, argv: Argv) => {
  try {
    const bldr = await initiateBldrSDK();
    //@ts-ignore //TODO figure out why contentBuilder is throwing TS error
    const { contentBuilder } = bldr.cli

    if (!bldr) {
      throw new Error('unable to load sdk')
    }

    switch (req) {
      case 'search':
        /**
         * Search for Content Builder Folders
         */
        if (argv.f) {
          const searchRequest = await contentBuilder.searchFolders({
            contentType: 'asset',
            searchKey: 'Name',
            searchTerm: argv.f
          })

          displayLine(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info')
          searchRequest.forEach((obj: any) => {
            displayObject(flatten(obj))
          })
        }

        /**
         * Search for Content Builder Assets
         */
        if (argv.a) {
          const searchRequest = await contentBuilder.searchAssets({
            searchKey: 'Name',
            searchTerm: argv.a
          })

          displayLine(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info')
          searchRequest.forEach((obj: any) => {
            displayObject(flatten(obj))
          })
        }
        break;


      case 'clone':
         /**
         * Search for Content Builder Folders
         */
          if (argv.f) {
            const cloneRequest = await contentBuilder.gatherAssetsByCategoryId({
              contentType: 'asset',
              categoryId: argv.f
            })
            
            cloneRequest && cloneRequest.length && await createEditableFiles(cloneRequest)
            // displayLine(`${argv.f} Search Results | ${searchRequest.length} Results`, 'info')
            // searchRequest.forEach((obj: any) => {
            //   displayObject(flatten(obj))
            // })
          }
  
          /**
           * Search for Content Builder Assets
           */
          if (argv.a) {
            const searchRequest = await contentBuilder.searchAssets({
              searchKey: 'Name',
              searchTerm: argv.a
            })
  
            displayLine(`${argv.a} Search Results | ${searchRequest.length} Results`, 'info')
            searchRequest.forEach((obj: any) => {
              displayObject(flatten(obj))
            })
          }
        break
    }

    return;
  } catch (err) {
    console.log(err)
  }
};

export { ContentBuilderSwitch };
