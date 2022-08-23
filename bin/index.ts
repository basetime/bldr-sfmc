#!/usr/bin/env node
import yargs from 'yargs';
import { stash_conf, state_conf } from '../lib/_bldr_sdk/store';
import { version } from '../lib/_bldr_sdk/version';
// Initiate all route switches
// const InitSwitch = require('../lib/_controllers/init')
import { ContextSwitch } from '../lib/_controllers/_context';
import { ConfigSwitch } from '../lib/_controllers/config';
import { AddSwitch } from '../lib/_controllers/add';
import { StashSwitch } from '../lib/_controllers/stash';
import { PushSwitch } from '../lib/_controllers/push';
import { StatusSwitch } from '../lib/_controllers/status';
import { PackageSwitch } from '../lib/_controllers/package'
import { InstallSwitch } from '../lib/_controllers/install'
import { displayLine, displayObject } from '../lib/_utils/display';
import { DeploySwitch } from '../lib/_controllers/deploy';
import { InitSwitch } from '../lib/_controllers/initiate';

// Parse requests and input arguments

const userInput: any = yargs;
const req = userInput.argv._[0] ? userInput.argv._[0].toLowerCase() : null;
const argv = userInput.argv;

/**
 * Initiate CLI application and route requests
 *
 * @param {string} req
 * @param {object} argv
 * @param {object} store
 */
const initCLI = async (req: string, argv: any) => {
    if (!req) {

        if (argv.v) {
            displayLine(`bldr version: ${version}`, 'info')
        }

        if(argv.h) {
            displayLine('config', 'success')
            displayObject({
                '-n, --new              ': 'Create New Configuration',
                '<instance name>        ': 'View Instance Configuration',
                '-l, --list             ': 'List all Configurations',
                '-s --set               ': 'Set Target Configuration to Use',
                '>> -m, --mid           ': 'Set Target MID to Use',
                '-r, --remove           ': 'Remove Configuration'
            })

            displayLine('status', 'success')
            displayObject({
                '                       ': 'Clear All Staged Files',
            })

            displayLine('stash', 'success')
            displayObject({
                '-c                     ': 'Show Current State and Staged Files',
            })

            displayLine('init', 'success')
            displayObject({
                '--cb                   ': 'Initiate Content Builder Project',
                '--config-only          ': 'Setup Variable Configurations for Project',
                '--update-config-keys   ': 'Update .sfmc.config.json keys found in content'
            })

            displayLine('search', 'success')
            displayLine('Search requires the use of context flags.', 'progress')
            displayObject({
                '--cb -f <search term>  ': 'Content Builder Folders',
                '--cb -a <search term>  ': 'Content Builder Assets',
                '--as -f <search term>  ': 'Automation Folders',
                '--as -a <search term>  ': 'Automation Assets',
            })

            displayLine('clone', 'success')
            displayLine('Clone requires the use of context flags.', 'progress')
            displayObject({
                '--cb -f <asset id>     ': 'Content Builder Folder ID to Clone',
                '--cb -a <asset id>     ': 'Content Builder Asset ID to Clone',
                '--as -f <asset id>     ': 'Automation Folder ID to Clone',
                '--as -a <asset id>     ': 'Automation Asset ID to Clone',
            })

            displayLine('add', 'success')
            displayObject({
                '.                      ': 'Add All Assets to the Stash to be Pushed into SFMC',
                '<file path>            ': 'Add One or Multiple Assets to the Stash to be Pushed into SFMC',
                '                       ': 'New Assets to be created will prompt for selection of asset type',
            })

            displayLine('push', 'success')
            displayObject({
                '                       ': 'Update or Create Assets/Folders in SFMC'
            })
        }
    } else {
        switch (req) {
            case 'init':
                InitSwitch(argv);
                break;
            /**
             * Config route handles all CLI configuration of SFMC Instance
             * See README for config details
             */
            case 'config':
                ConfigSwitch(req, argv);
                break;

            /**
             * Add files in bulk or by filepath to the stash.json file
             */
            case 'add':
                AddSwitch(req, argv);
                break;

            /**
             * Works with Stash operations
             */
            case 'stash':
                StashSwitch(argv);
                break;

            /**
             * Displays current State and Staged Files
             */
            case 'status':
                StatusSwitch();
                break;

            /**
             * Format and push Staged files into current State SFMC Instance
             */
            case 'push':
                PushSwitch();
                break;
            /**
             * Package Files
             */
            case 'package':
                PackageSwitch();
                break;

            case 'install':
                InstallSwitch(argv);
                break;

            case 'deploy':
               DeploySwitch();
                break;

            // case 'patch':
            //     patchSwitch.switch(argv);
            //     break;
            // /**
            //  * Default handles all context specific routes
            //  * Context specific routes are located in utils/Blueprint/context/:context
            //  */
            default:
                ContextSwitch(req, argv);
        }
    }
};

initCLI(req, argv);
