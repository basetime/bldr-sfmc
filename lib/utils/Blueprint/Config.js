const yargsInteractive = require("yargs-interactive");
const utils = require("../utils");
const opts = require("../options");
const coreConfigurationOptions = {
  init: opts.init(),
  delete: opts.delete()
}


module.exports = class Config {
  constructor(configuration) {
    this.configuration = configuration;
  }

  init() {
    yargsInteractive()
      .usage("$0 <command> [args]")
      .interactive(coreConfigurationOptions.init)
      .then((configResults) => {
        const configured = {
          instance: configResults.instance,
          parentMID: configResults.parentMID,
          apiClientId: configResults.apiClientId,
          apiClientSecret: configResults.apiClientSecret,
          instanceSubdomain: configResults.instanceSubdomain,
        };


        this.configuration.set(configured.instance, configured);
      });
  }


  get(instance) {
    const req = instance ? this.configuration.get(instance) : this.configuration.get();
    const resp = instance ? req :  utils.assignObject(req);
    return resp
  }


  list(argv) {
    try {
      const configurationResp = this.get();
      if (!configurationResp) 
        throw new Error(`No configurations found`);
  
      const config = utils.assignObject(configurationResp);
  
      if (argv.a) {
        console.log(config);
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
        .interactive(coreConfigurationOptions.delete)
        .then(async (result) => {
          if (!result.confirmDelete) return;

          this.configuration.delete(instance);
          const status = !existingConfigurations.hasOwnProperty(instance)
            ? console.log(`${instance} was deleted successfully.`)
            : console.log(`${instance} was not deleted.`);
        });

      return;
    } catch (err) {
      console.log(err);
    }
  }
}
