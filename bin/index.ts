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
import { PackageSwitch } from '../lib/_controllers/package';
import { InstallSwitch } from '../lib/_controllers/install';
import { displayLine, displayObject } from '../lib/_utils/display';
import { DeploySwitch } from '../lib/_controllers/deploy';
import { InitSwitch } from '../lib/_controllers/initiate';
import { State } from '../lib/_bldr/_processes/state';

const { checkForTracking } = new State()

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
    await checkForTracking();

    if (!req) {
        if (argv.v) {
            displayLine(`bldr version: ${version}`, 'info');
        }

        if (argv.h) {
            displayLine('config', 'success');
            displayObject({
                '-n, --new                          ': 'Create New Configuration',
                '>> Web App Redirect URI            ': 'https://bldr.io/cli/sfmc/authenticate/',
                '<instance name>                    ': 'View Instance Configuration',
                '-l, --list                         ': 'List all Configurations',
                '-s --set                           ': 'Set Target Configuration to Use',
                '>> -m, --mid                       ': 'Set Target MID to Use',
                '-r, --remove                       ': 'Remove Configuration',
                '--verbose                          ': 'Toggle Verbose Messaging',
                '--analytics                        ': 'Toggle Analytics Capturing',
            });

            displayLine('status', 'success');
            displayObject({
                '                                   ': 'Show Current State and Staged Files',
            });

            displayLine('stash', 'success');
            displayObject({
                '-c                                 ': 'Clear All Staged Files',
            });

            displayLine('init', 'success');
            displayObject({
                '--cb                               ': 'Initiate Content Builder Project',
                '--de                               ': 'Initiate Data Extension',
                '--env-only                         ': 'Setup Environment Variables for Project',
                '--update-env-keys                  ': 'Update .sfmc.env.json keys found in content',
            });

            displayLine('search', 'success');
            displayLine('Search requires the use of context flags.', 'progress');
            displayObject({
                '--cb -f <search term>              ': 'Content Builder Folders',
                '--cb -a <search term>              ': 'Content Builder Assets',
                '--as -f <search term>              ': 'Automation Folders',
                '--as -a <search term>              ': 'Automation Assets',
                '--as -f:sql  <search term>         ': 'SQL Activity Folders',
                '--as -a:sql  <search term>         ': 'SQL Activity Assets',
                '--as -f:ssjs <search term>         ': 'SSJS Activity Folders',
                '--as -a:ssjs <search term>         ': 'SSJS Activity Assets',
                '--de -f <search term>              ': 'Data Extension Folders',
                '--de -a <search term>              ': 'Data Extension Assets',
            });

            displayLine('clone', 'success');
            displayLine('Clone requires the use of context flags.', 'progress');
            displayObject({
                '--cb -f <folder id>                ': 'Content Builder Folder ID to Clone',
                '--cb -a <asset id>                 ': 'Content Builder Asset ID to Clone',
                '--as -f <folder id>                ': 'Automation Folder ID to Clone',
                '--as -a <object id>                ': 'Automation Object ID to Clone',
                '--as -f:sql  <folder id>           ': 'SQL Activity Folders',
                '--as -a:sql  <definition id>       ': 'SQL Activity Assets',
                '--as -f:ssjs <folder id>           ': 'SSJS Activity Folders',
                '--as -a:ssjs <definition id>       ': 'SSJS Activity Assets',
                '--de -f <folder id>                ': 'Data Extension Folder Id to Clone',
                '--de -a <customer key>             ': 'Data Extension Customer Key to Clone',
            });

            displayLine('add', 'success');
            displayObject({
                '.                                  ': 'Add All Assets to the Stash to be Pushed into SFMC',
                '<file path>                        ': 'Add One or Multiple Assets to the Stash to be Pushed into SFMC',
                '                                   ': 'New Assets to be created will prompt for selection of asset type',
            });

            displayLine('push', 'success');
            displayObject({
                '                                   ': 'Update or Create Assets/Folders in SFMC',
            });

            displayLine('package [beta]', 'success');
            displayObject({
                '                                   ': 'Package cloned files',
            });

            displayLine('install [beta]', 'success');
            displayObject({
                '<github url>                       ': 'Download package files from repository',
            });

            displayLine('deploy [beta]', 'success');
            displayObject({
                '--sfmc-only                        ': 'Create files in SFMC only [only recommended for flat packages]',
                '--local-only                       ': 'Create files in locally only [only recommended for flat packages]',
                '                                   ': 'Create local files and push to SFMC',
            });
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
                DeploySwitch(argv);
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
