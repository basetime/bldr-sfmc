const yargsInteractive = require("yargs-interactive");
const utils = require("../utils");
const coreConfigurationOptions = require("../options");
const State = require("./State");

module.exports = class Config {
  constructor(coreConfiguration, stateConfiguration, blueprintInit) {
    this.coreConfiguration = coreConfiguration;
    this.stateConfiguration = stateConfiguration;
    this.blueprintInit = blueprintInit;
  }

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
        
        const updatedConfiguration = await this.setChildBusinessUnits(configured);
        await this.coreConfiguration.set(configured.instance, updatedConfiguration)
        
      })
  }


  get(instance) {
    const req = instance ? this.coreConfiguration.get(instance) : this.coreConfiguration.get();
    const resp = instance ? req : utils.assignObject(req);
    return resp
  }


  list(argv) {
    try {
      const configurationResp = argv.l ? this.get(argv.l) : this.get();
      if (!configurationResp)
        throw new Error(`No configurations found`);

      const config = utils.assignObject(configurationResp);

      if (argv.a) {
        console.log(JSON.stringify(config, null, 2));
      } else if (!argv.a) {
        for (const c in config) {
          console.log(`${config[c].instance}`);
        }
      }

    } catch (err) {
      console.log(err);
    }
  }


  delete(argv) {
    try {
      if (typeof argv.d !== "string" && typeof argv.delete !== "string")
        throw new Error(`Please provide an instance after the -d flag.`);

      const instance = argv.d ? argv.d
        : argv.delete ? argv.delete
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



  async setChildBusinessUnits(configured) {
    const blueprint = await this.blueprintInit.set();
    const accountDetails = await blueprint.bldr.account.getAllAccountDetails();

    configured.mids = accountDetails.map((bu) => {
      return {
        mid: bu.Client.ClientID,
        name: bu.BusinessName
      }
    })

    return configured
  }


}
