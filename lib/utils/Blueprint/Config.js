const Encryption = require('../Encryption');
const yargsInteractive = require('yargs-interactive');
const Column = require('../help/Column');
const utils = require('../utils');
const display = require('../displayStyles');
const { styles, width } = display.init();

const coreConfigurationOptions = require('../options');
const blueprintInit = require('../Blueprint');
const crypto = new Encryption();

/**
 * Handles all Configuration commands
 * @property {object} coreConfiguration
 * @property {object} stateConfiguration
 */
module.exports = class Config {
    constructor(coreConfiguration, stateConfiguration) {
        this.coreConfiguration = coreConfiguration;
        this.stateConfiguration = stateConfiguration;
    }

    /**
     * Initate the setting of a Configuration
     * Prompts user input
     * Saves configuration to config file
     * Sets configuration to state management file
     * Tests/Gathers all child business unit Names and MIDs
     * Updates configuration file
     *
     * @param {string} instance Name of SFMC instance Configuration
     * @param {string} parentMID Enterprise (parent) Business Unit MID
     * @param {string} apiClientId Client ID from Installed Package
     * @param {string} apiClientSecret Client Secret from Installed package
     * @param {string} authURI Subdomain for SFMC API calls from Installed Package URIs
     *
     */
    init(argv) {
        const ignoreError = argv.ignoreError || false;
        console.log(ignoreError)
        try {
            yargsInteractive()
                .usage('$bldr config [args]')
                .interactive(coreConfigurationOptions.init())
                .then(async (configResults) => {

                    // Check for .env file/Create if needed
                    // Create encryption key specific to user
                    await crypto.envFile()

                    // Build Configuration Object based on user inputs
                    const configured = {
                        instance: configResults.instance,
                        parentMID: configResults.parentMID,
                        apiClientId: await crypto.encrypt(configResults.apiClientId),
                        apiClientSecret: await crypto.encrypt(configResults.apiClientSecret),
                        authURI: configResults.authURI,
                    };

                    // Save configuration to config.json file
                    await this.coreConfiguration.set(
                        configured.instance,
                        configured
                    );
                    // Set newly configured instance to state management
                    await this.stateConfiguration.set({
                        instance: configured.instance,
                        parentMID: configured.parentMID,
                    });

                    // Inital test of API credentials
                    // Gather all Child Business Unit Names/MIDs from SFMC
                    const setMids = await this.setChildBusinessUnits(
                        configured,
                        ignoreError
                    );

                    if (setMids === 'OK') {
                        const displayContent = [
                            [
                                new Column(
                                    `${styles.callout(
                                        `${configured.instance} Saved Successfully and Set as Current Instance`
                                    )}`,
                                    width.c3
                                ),
                            ],
                        ];

                        display.render([], displayContent);
                    }
                });
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Retrieve configuration for a specific instance or all saved configurations
     * @param {string} instance Name of configuration to get
     * @returns {object}
     *
     */
    async get(instance, show) {
        const req = instance
            ? this.coreConfiguration.get(instance)
            : this.coreConfiguration.get();
        let resp = await utils.assignObject(req);

        if (instance && show) {
            const headers = [new Column(`Instance Details (showing first 5 characters of credentials)`, width.c3)];

            // const replace = "*".repeat(21);
            // resp.apiClientId = await crypto.decrypt(resp.apiClientId).substring(0, 5) + replace
            // resp.apiClientSecret = await crypto.decrypt(resp.apiClientSecret).substring(0, 5) + replace

            resp.apiClientId = await crypto.decrypt(resp.apiClientId).substring(0, 5)
            resp.apiClientSecret = await crypto.decrypt(resp.apiClientSecret).substring(0, 5)

            const displayContent = [
                [new Column(`${JSON.stringify(resp, null, 2)}`, width.c3)],
            ];

            display.render(headers, displayContent);
        }

        return resp;
    }

    /**
     * Retrieve and List Instance Names, Full Details
     * @param {object} argv
     */
    async list(argv) {
        try {
            const configurationResp = argv.l ? await this.get(argv.l) : await this.get();

            if (!configurationResp) {
                throw new Error(`No configurations found`);
            }

            const config = await utils.assignObject(configurationResp);

            if (argv.d || argv.details) {
                // Display all details for pulled configurations
                console.log(JSON.stringify(config, null, 2));
            } else {
                // Display all saved configuration names
                this._displayInstanceNames(config);
            }
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Remove configuration from config file by Instance Name
     * @param {string} argv
     * @returns
     */
    async remove(argv) {
        try {
            if (typeof argv.r !== 'string' && typeof argv.remove !== 'string')
                throw new Error(
                    `Please provide an instance after the -r flag.`
                );

            const instance = argv.r ? argv.r : argv.remove ? argv.remove : null;
            const configurationResp = await this.get(instance);
            const headers = [new Column(`Instance Details`, width.c3)];

            const displayContent = [
                [
                    new Column(
                        `${JSON.stringify(configurationResp, null, 2)}`,
                        width.c3
                    ),
                ],
            ];

            display.render(headers, displayContent);

            yargsInteractive()
                .usage('$0 <command> [args]')
                .interactive(coreConfigurationOptions.delete(instance))
                .then((result) => {
                    if (!result.confirmDelete) return;

                    this.coreConfiguration.delete(instance);

                    let displayMsg = !Object.prototype.hasOwnProperty.call(
                        configurationResp,
                        instance
                    )
                        ? `${instance} was Deleted Successfully.`
                        : `${instance} was Not Deleted.`;

                    const displayContent = [
                        [new Column(`${styles.callout(displayMsg)}`, width.c3)],
                    ];

                    display.render([], displayContent);
                });

            return;
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * Test API Access and gather all Child Business unit Names/MIDs
     * @param {object} configured configured inputs from user
     */
    async setChildBusinessUnits(configured, ignoreError) {
        try {
            const blueprint = await blueprintInit.set(null, {
                state: this.stateConfiguration,
                config: this.coreConfiguration,
            });

            const accountDetails =
                await blueprint.bldr.account.getAllAccountDetails();

            if (accountDetails.OverallStatus !== 'OK')
                throw new Error(accountDetails.OverallStatus);

            configured.mids = accountDetails.Results.map((bu) => {
                return {
                    mid: bu.Client.ClientID,
                    name: bu.BusinessName,
                };
            });

            await this.coreConfiguration.set(configured.instance, configured);

            return configured.mids.length > 0 ? 'OK' : 'ERROR';
        } catch (err) {
            if(ignoreError){
                const displayContent = [
                    [new Column(`${styles.callout('bldr caught a configuration error:')}`, width.c3)],
                    [new Column(`${styles.callout(err)}`, width.c3)],
                    [new Column(`${styles.callout('run [ bldr config -l ] to ensure configuration is saved')}`, width.c3)],
                ];

                display.render([], displayContent);
            } else {

            const displayContent = [
                [new Column(`${styles.callout('bldr caught a configuration error:')}`, width.c3)],
                [new Column(`${styles.callout(err)}`, width.c3)],
                [new Column(`${styles.callout('retry [ bldr config -n ] with an additional [ --ignoreError ] flag. See NPM/GitHub documentation for details.')}`, width.c3)],
            ];

            display.render([], displayContent);

            this.coreConfiguration.delete(configured.instance);
            this.stateConfiguration.clear();
        }
        }
    }

    /**
     * Update all existing configurations to be encrypted
     */
    async encryptExisting() {
            await crypto.envFile();

            const config = await this.get();
            const envs = Object.keys(config)
            const updated = [];

            for (const c in envs) {
                const env = envs[c]
                const { apiClientId, apiClientSecret } = config[env]

                let encrypted = {};
                if (!apiClientId.includes('@|@')) {
                    encrypted.apiClientId = await crypto.encrypt(apiClientId)
                }

                if (!apiClientSecret.includes('@|@')) {
                    encrypted.apiClientSecret = await crypto.encrypt(apiClientSecret)
                }

                if (encrypted.apiClientId && encrypted.apiClientSecret) {
                    await this.coreConfiguration.set(`${env}.apiClientId`, encrypted.apiClientId);
                    await this.coreConfiguration.set(`${env}.apiClientSecret`, encrypted.apiClientSecret);
                    updated.push(env)
                }

            }


            if (updated.length > 0) {
                const headers = [
                    new Column(`Updated Environments`, width.c3)
                ];
                const displayContent = updated.map((env) => {
                    return [
                        new Column(`${env}`, width.c3)
                    ];
                });

                display.render(headers, displayContent);
            }
    }

    /**
     * CLI Display for CMD List/Mids
     * @param {object} config
     */
    _displayMids(config) {
        const headers = [
            new Column(`Business Unit Name`, width.c2),
            new Column(`MID`, width.c0),
        ];

        const displayContent = config.mids.map((result) => {
            return [
                new Column(`${result.name}`, width.c2),
                new Column(`${result.mid}`, width.c0),
            ];
        });

        display.render(headers, displayContent);
    }

    /**
     * CLI Display for CMD List/Default
     * @param {object} config
     */
    _displayInstanceNames(config) {
        const configArray = [];
        for (const c in config) {
            configArray.push(config[c].instance);
        }

        if (configArray.length !== 0) {
            const headers = [new Column(`Instance Names`, width.c2)];

            const displayContent = configArray.map((result) => {
                return [new Column(`${result}`, width.c2)];
            });

            display.render(headers, displayContent);
        } else {
            const headers = [new Column(`Instance Names`, width.c2)];

            const displayContent = [
                [
                    new Column(
                        `${styles.callout('No Configured Instances')}`,
                        width.c2
                    ),
                ],
            ];

            display.render(headers, displayContent);
        }
    }
};
