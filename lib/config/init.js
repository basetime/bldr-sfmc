const yargsInteractive = require("yargs-interactive");
const utils = require("../utils/index");
const initOpts = require("./options");
const Conf = require("conf");

let config = new Conf();

module.exports.init = () => {
  const options = initOpts.initOptions();
  const handleConfig = (result) => {
    const configuration = {
      instance: result.instance,
      parentMID: result.parentMID,
      apiClientId: result.apiClientId,
      apiClientSecret: result.apiClientSecret,
      instanceSubdomain: result.instanceSubdomain,
    };
  
    config.set(configuration.instance, configuration);
  };

  
  yargsInteractive()
    .usage("$0 <command> [args]")
    .interactive(options)
    .then((result) => handleConfig(result));
};


module.exports.getConfiguration = (instance) => {
  try {
    const configuration = instance ? config.get(instance) : config.get();

    if (!configuration)
      throw new Error(`No Configuration found for ${instance}`);

    return utils.assignObject(configuration);
  } catch (err) {
    console.log(err);
  }
};

module.exports.listConfigurations = (argv) => {
  try {
    const configurationResp = this.getConfiguration();
    if (!configurationResp) throw new Error(`No configurations found`);

    const config = utils.assignObject(configurationResp);

    if (argv.a) {
      console.log(config);
    } else if (!argv || !argv.a) {
      for (const c in config) {
        console.log(`${config[c].instance}`);
      }
    }

  } catch (err) {
    console.log(err);
  }
};

module.exports.deleteConfiguration = (argv) => {
  try {
    if (typeof argv.d !== "string" && typeof argv.delete !== "string")
      throw new Error(`Please provide an instance after the -d flag.`);

    const instance = argv.d ? argv.d
      : argv.delete ? argv.delete
      : null;

    const configurationResp = this.getConfiguration(instance);
    const options = initOpts.deleteOptions(instance);

    console.log(configurationResp);

    yargsInteractive()
      .usage("$0 <command> [args]")
      .interactive(options)
      .then(async (result) => {
        if (!result.confirmDelete) return;

        config.delete(instance);
        const existingConfigurations = await this.getConfiguration();
        const status = !existingConfigurations.hasOwnProperty(instance)
          ? console.log(`${instance} was deleted successfully.`)
          : console.log(`${instance} was not deleted.`);
      });

    return;
  } catch (err) {
    console.log(err);
  }
};
