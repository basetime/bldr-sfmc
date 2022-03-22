const yargsInteractive = require("yargs-interactive");
const utils = require('../index')

module.exports = class State {
  constructor(configuration, stateConfig) {
    this.configuration = configuration;
    this.stateConfig = stateConfig;
  }

  get(key, show) {
    try {
      if (!key){
        if(show)
          console.log(utils.assignObject(this.stateConfig.get()))
          
        return utils.assignObject(this.stateConfig.get());
      } else {
      if (key && this.stateConfig.has(key))
        if(show) 
          console.log(this.stateConfig.get(key))
         
         return this.stateConfig.get(key);
      }
    } catch (err) {
      console.log(err);
    }
  }


  set(argv) {
    try {
      if (typeof argv.s !== "string")
        throw new Error("Please provide an Instance Name to Set.");

      const currentState = this.get();

      if (currentState && currentState.instance === argv.s)
        return console.log(`${argv.s} is already set.`);

      const clientConfig = this.configuration.get(argv.s);
      const initState = {
        instance: argv.s,
        parentMID: clientConfig.parentMID,
      };

      state.set(initState);
    } catch (err) {
      console.log(err);
    }
  }

  update(update) {
    if (!update.key)
      throw new Error('Key required')

    if (!update.value)
      throw new Error('Value required')

    return this.stateConfig.set(update.key, update.value)
  }

  deleteKey(argv) {
    return this.stateConfig.has(argv.d) ? this.stateConfig.delete(argv.d) : null;
  }

  clear() {
    return this.stateConfig.clear();
  }

}


