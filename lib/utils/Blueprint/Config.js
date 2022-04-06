const yargsInteractive = require("yargs-interactive");

const utils = require("../utils");
const display = require('../displayStyles');
const { styles, width } = display.init();

const Column = require("../help/Column")
const State = require("./State");

const coreConfigurationOptions = require("../options");
const blueprintInit = require('../Blueprint')

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
   * @param {string} instanceSubdomain Subdomain for SFMC API calls from Installed Package URIs
   * 
   */
  init() {
    yargsInteractive()
      .usage("$bldr config [args]")
      .interactive(coreConfigurationOptions.init())
      .then(async (configResults) => {
        // Initiate State Class
        const stateInit = new State(this.coreConfiguration, this.stateConfiguration)

        // Build Configuration Object based on user inputs
        const configured = {
          instance: configResults.instance,
          parentMID: configResults.parentMID,
          apiClientId: configResults.apiClientId,
          apiClientSecret: configResults.apiClientSecret,
          instanceSubdomain: configResults.instanceSubdomain,
        };


        // Save configuration to config.json file
        await this.coreConfiguration.set(configured.instance, configured);
        // Set newly configured instance to state management
        await this.stateConfiguration.set({
          instance: configured.instance,
          parentMID: configured.parentMID,
        })

        // Inital test of API credentials
        // Gather all Child Business Unit Names/MIDs from SFMC
        await this.setChildBusinessUnits(configured);
      })
  }



  /**
   * Retrieve configuration for a specific instance or all saved configurations
   * @param {string} instance Name of configuration to get 
   * @returns {object}
   * 
   */
  get(instance, show) {
    const req = instance ? this.coreConfiguration.get(instance) : this.coreConfiguration.get();
    const resp = instance ? req : utils.assignObject(req);

    if (instance && show) {
      const headers = [
        new Column(`Instance Details`, width.c3),
      ]

      const displayContent = [[
        new Column(`${JSON.stringify(resp, null, 2)}`, width.c3),
      ]]


      display.render(headers, displayContent)
    }

    return resp
  }


  /**
   * Retrieve and List Instance Names, Full Details
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

      } else {
        // Display all saved configuration names
        this._displayInstanceNames(config)
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
  remove(argv) {
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

      const blueprint = await blueprintInit.set(null, { state: this.stateConfiguration, config: this.coreConfiguration });
      const accountDetails = await blueprint.bldr.account.getAllAccountDetails();

      configured.mids = accountDetails.map((bu) => {
        return {
          mid: bu.Client.ClientID,
          name: bu.BusinessName
        }
      })

      await this.coreConfiguration.set(configured.instance, configured)

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
