const yargsInteractive = require("yargs-interactive");
const utils = require("../utils");

// const cliFormat = require('cli-format')
const Column = require("../help/Column")
const display = require('../displayStyles');
const { styles, width } = display.init();



const coreConfigurationOptions = require("../options");
const State = require("./State");

module.exports = class Config {
  constructor(coreConfiguration, stateConfiguration, blueprintInit) {
    this.coreConfiguration = coreConfiguration;
    this.stateConfiguration = stateConfiguration;
    this.blueprintInit = blueprintInit;
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
   * @param {string} instanceSubdomain Subdomain for SFMC API calls from Installed Package URIs
   * 
   */
  init() {
    yargsInteractive()
      .usage("$0 <command> [args]")
      .interactive(coreConfigurationOptions.init())
      .then(async (configResults) => {
        const configured = {
          instance: configResults.instance,
          parentMID: configResults.parentMID,
          apiClientId: configResults.apiClientId,
          apiClientSecret: configResults.apiClientSecret,
          instanceSubdomain: configResults.instanceSubdomain,
        };

        const stateInit = new State(this.coreConfiguration, this.stateConfiguration)

        await this.coreConfiguration.set(configured.instance, configured);
        await this.stateConfiguration.set({
          instance: configured.instance,
          parentMID: configured.parentMID,
        })

        await this.setChildBusinessUnits(configured);
      })
  }


  /**
   * Get configuration for a specific instance or all saved configurations
   * @param {string} instance Name of configuration to get 
   * @returns {object}
   * 
   */
  get(instance) {
    const req = instance ? this.coreConfiguration.get(instance) : this.coreConfiguration.get();
    const resp = instance ? req : utils.assignObject(req);
    return resp
  }


  /**
   * List Instance Names, Available MIDs, Full Details
   * @param {object} argv 
   */
  list(argv) {
    try {
      const configurationResp = argv.l ? this.get(argv.l) : this.get();

      if (!configurationResp)
        throw new Error(`No configurations found`);

      const config = utils.assignObject(configurationResp);

      if (argv.d || argv.details) {

        // Display all details for pulled configurations
        console.log(JSON.stringify(config, null, 2));

      } else if (argv.m || argv.mid) {

        // Display Mid Information
        this._displayMids(config)

      } else {
        // Display all saved configuration names
        this._displayInstanceNames(config)
      }

    } catch (err) {
      console.log(err);
    }
  }


  /**
   * Delete configuration from config file by Instance Name
   * @param {string} argv 
   * @returns 
   */
  delete(argv) {
    try {
      if (typeof argv.r !== "string" && typeof argv.remove !== "string")
        throw new Error(`Please provide an instance after the -r flag.`);

      const instance = argv.r ? argv.r
        : argv.remove ? argv.remove
          : null;

      const configurationResp = this.get(instance);
      console.log(configurationResp)

      yargsInteractive()
        .usage("$0 <command> [args]")
        .interactive(coreConfigurationOptions.delete(instance))
        .then((result) => {
          if (!result.confirmDelete) return;

          this.coreConfiguration.delete(instance);
          const status = !configurationResp.hasOwnProperty(instance)
            ? console.log(`${instance} was deleted successfully.`)
            : console.log(`${instance} was not deleted.`);
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
  async setChildBusinessUnits(configured) {
    try {

      const blueprint = await this.blueprintInit.set();
      const accountDetails = await blueprint.bldr.account.getAllAccountDetails();

      configured.mids = accountDetails.map((bu) => {
        return {
          mid: bu.Client.ClientID,
          name: bu.BusinessName
        }
      })

      await this.coreConfiguration.set(configured.instance, updatedConfiguration)

    } catch (err) {
      this.coreConfiguration.delete(configured.instance);
      this.stateConfiguration.clear()
      throw err
    }
  }


  /**
   * CLI Display for CMD List/Mids
   * @param {object} config 
   */
  _displayMids(config) {
    const headers = [
      new Column(`Business Unit Name`, width.c2),
      new Column(`MID`, width.c0)
    ]

    const displayContent = config.mids.map((result) => {
      return [
        new Column(`${result.name}`, width.c2),
        new Column(`${result.mid}`, width.c0),
      ]
    })

    display.render(headers, displayContent)
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

    const headers = [
      new Column(`Instance Names`, width.c2)
    ]

    const displayContent = configArray.map((result) => {
      return [
        new Column(`${result}`, width.c2)
      ]
    })

    display.render(headers, displayContent)
  }
}
