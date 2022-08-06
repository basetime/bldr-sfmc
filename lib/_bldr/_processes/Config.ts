import yargsInteractive from 'yargs-interactive';
import { state_conf } from '../../_bldr_sdk/store';
import { State } from '../_processes/State';
import { config_new, config_remove } from '../../_utils/options';
import { Crypto } from '../_utils/crypto';
import { initiateBldrSDK } from '../../_bldr_sdk';
import { handleError } from '../../_utils/handleError';
import { displayLine, displayObject, displayArrayOfStrings } from '../../_utils/display';
import { BLDR_Client } from '@basetime/bldr-sfmc-sdk/lib/cli/types/bldr_client';
import { InstanceConfiguration } from '../../_types/InstanceConfiguration';
import { Argv } from '../../_types/Argv';

import { getPassword, setPassword, findCredentials, deletePasswordSync, getPasswordSync } from 'keytar-sync';

const { setEncryption, encrypt, decrypt } = new Crypto();

const { getState } = new State();

/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
export class Config {
    constructor() {}
    /**
     * Initiate the setting of a Configuration
     * Prompts user input
     * Tests/Gathers all child business unit Names and MIDs
     * Saves configuration to config file
     * Sets configuration to state management file
     * @param argv
     *
     */
    initiateConfiguration = async (argv: Argv) => {
        try {
            yargsInteractive()
                .usage('$bldr config [args]')
                .interactive(config_new)
                .then(async (configResults) => {
                    // Check for encryption entries in psw mgmt
                    // Create entries if needed
                    await setEncryption();

                    // Build Configuration Object based on user inputs
                    const configured: {
                        instance: string;
                        parentMID: number;
                        apiClientId: string;
                        apiClientSecret: string;
                        authURI: string;
                    } = {
                        instance: configResults.instance,
                        parentMID: Number(configResults.parentMID),
                        apiClientId: configResults.apiClientId,
                        apiClientSecret: configResults.apiClientSecret,
                        authURI: configResults.authURI,
                    };

                    const sdk: BLDR_Client = await initiateBldrSDK({
                        client_id: configured.apiClientId,
                        client_secret: configured.apiClientSecret,
                        account_id: configured.parentMID,
                        auth_url: configured.authURI,
                    });

                    // Throw Error if SDK Fails to Load
                    if (!sdk) {
                        displayLine('Unable to test configuration. Please review and retry.', 'error');
                        return;
                    }

                    // Get All Business Unit Details from provided credentials
                    //@ts-ignore //TODO figure out why getAllBusinessUnitDetails is throwing TS error
                    const getAllBusinessUnitDetails = await sdk.sfmc.account.getAllBusinessUnitDetails();

                    // Throw Error if there are issues with getting Business Unit Details
                    if (!getAllBusinessUnitDetails) {
                        throw new Error('Unable to get Instance Details. Please review credentials.');
                    }

                    // Isolate each Business Unit Name and MID for stored configuration
                    const instanceBusinessUnits = getAllBusinessUnitDetails.map((bu: { Name: string; ID: number }) => {
                        return {
                            name: bu.Name,
                            mid: bu.ID,
                        };
                    });

                    // Encrypt Configuration object
                    const encryptedConfiguration = {
                        ...configured,
                        mids: instanceBusinessUnits,
                        apiClientId: await encrypt(configResults.apiClientId),
                        apiClientSecret: await encrypt(configResults.apiClientSecret),
                    };

                    // Store credentials in users PSW Management
                    // OSX Keychain Access
                    // Windows Credential Manager
                    await setPassword('bldr', configured.instance, JSON.stringify(encryptedConfiguration));

                    // Set newly configured instance to Current State
                    await state_conf.set({
                        instance: configured.instance,
                        parentMID: configured.parentMID,
                        activeMID: configured.parentMID,
                    });

                    displayLine(`${configured.instance} Configuration Saved`, 'success');
                });
        } catch (err) {
            return handleError(err);
        }
    };
    /**
     * Retrieve configuration for a specific instance or all saved configurations
     * @param {string} instance Name of configuration to get
     * @param {boolean} show toggle the displaying of information
     * @returns {object}
     *
     */
    getInstanceConfiguration = async (
        instance: string,
        show?: boolean
    ): Promise<{
        apiClientId: string;
        apiClientSecret: string;
        parentMID: number;
        mids: any[];
        authURI: string;
    }> => {
        if (!instance) {
            displayLine('Please provide an instance name', 'error');
        }

        // Retrieve Configuration from PSW Manager
        let config = instance && (await getPassword('bldr', instance));

        if (!config) {
            throw new Error(`No configurations found for ${instance}`);
        }

        // Transform string into parse-able JSON
        let configJSON: InstanceConfiguration = JSON.parse(config);

        // Decrypt Client_Id and Secret
        configJSON.apiClientId = await decrypt(configJSON.apiClientId);
        configJSON.apiClientSecret = await decrypt(configJSON.apiClientSecret);

        if (configJSON && show) {
            // Cut string off to only show first 5 characters
            configJSON.apiClientId = configJSON.apiClientId.substring(0, 5);
            configJSON.apiClientSecret = configJSON.apiClientSecret.substring(0, 5);

            displayLine(`Instance Details (showing first 5 characters of credentials)`, 'info');
            displayObject(configJSON);
        }

        return configJSON;
    };
    /**
     * Retrieve and List Instance Names, Full Details
     * @param {object} argv
     */
    listInstanceConfiguration = async (argv: Argv) => {
        // If a value is provided pass to the getInstanceConfiguration function to retrieve and display
        if ((argv.l && typeof argv.l === 'string') || (argv.list && typeof argv.list === 'string')) {
            const instanceStr = argv.l || argv.list || '';
            this.getInstanceConfiguration(instanceStr, true);
        }

        // If no value is provided get all stored credentials and pull the instance names
        const instanceArr: any[] =
            (await findCredentials('bldr'))
                .map((item) => {
                    if (item.account !== 'io' && item.account !== 'salty') {
                        return item.account;
                    }
                })
                .filter(Boolean) || [];

        if (instanceArr.length) {
            displayLine(`Configured Instances`, 'info');
            displayArrayOfStrings(instanceArr);
        } else {
            displayLine(`There are no Configured Instances`, 'info');
        }
    };
    /**
     * Remove configuration by Instance Name
     *
     * @param {string} argv
     * @returns
     */
    removeConfiguration = async (argv: Argv) => {
        try {
            if ((argv.r && typeof argv.r !== 'string') || (argv.remove && typeof argv.remove !== 'string')) {
                displayLine(`Please provide an Instance Name to remove`, 'error');
                return;
            }

            // Retrieve Instance Name from input
            const instance = argv.r ? argv.r : argv.remove ? argv.remove : null;

            if (!instance) {
                displayLine(`Unable to find Instance Name in your request, please try again`, 'error');
                return;
            }

            // Display configuration for verification
            await this.getInstanceConfiguration(instance, true);

            // Verify the deletion of the displayed configuration
            yargsInteractive()
                .usage('$0 <command> [args]')
                .interactive(config_remove(instance))
                .then(async (result) => {
                    if (!result.confirmDelete) {
                        return;
                    }

                    // Delete entry for instance
                    await deletePasswordSync('bldr', instance);
                    // Check that entry no longer exists to confirm delete
                    let checkDeletion = await getPasswordSync('bldr', instance);

                    !checkDeletion
                        ? displayLine(`${instance} was Deleted Successfully.`, 'success')
                        : displayLine(`${instance} was Not Deleted.`, 'error');
                });

            return;
        } catch (err: any) {
            return handleError(err.message);
        }
    };

    /**
     * Set a configured Instance as your target
     *
     * @param argv
     * @returns
     */
    setConfiguration = async (argv: Argv) => {
        try {
            const instanceToSet = argv.s || argv.set;
            const midToSet = argv.m || argv.mid || null;

            if (typeof instanceToSet !== 'string') {
                displayLine('Please provide an Instance Name to Set.', 'error');
                return;
            }

            const clientConfig: InstanceConfiguration = await this.getInstanceConfiguration(instanceToSet);

            if (!clientConfig) {
                throw new Error(`${instanceToSet} is not Configured`);
            }

            if (midToSet && !clientConfig.mids.find((bu) => bu.mid === midToSet)) {
                throw new Error(`${midToSet} is not a Valid MID`);
            }

            const initState = {
                instance: instanceToSet,
                parentMID: clientConfig.parentMID,
                activeMID: midToSet || clientConfig.parentMID,
            };

            state_conf.set(initState);

            displayLine(`${instanceToSet} has been set to target instance`, 'success');
            displayObject(initState);
        } catch (err: any) {
            displayLine(`There was an error setting your target instance`, 'error');
            displayLine(err.message, 'error');
        }
    };
}
