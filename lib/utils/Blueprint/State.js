const yargsInteractive = require("yargs-interactive");
const utils = require('../utils')

module.exports = class State {
  constructor(coreConfiguration, stateConfiguration) {
    this.coreConfiguration = coreConfiguration;
    this.stateConfiguration = stateConfiguration;
  }

  get(key, show) {
    try {
      if (!key){
        if(show)
          console.log(utils.assignObject(this.stateConfiguration.get()))
          
        return utils.assignObject(this.stateConfiguration.get());
      } else {
      if (key && this.stateConfiguration.has(key))
        if(show) 
          console.log(this.stateConfiguration.get(key))
         
         return this.stateConfiguration.get(key);
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

      const clientConfig = this.coreConfiguration.get(argv.s);
      const initState = {
        instance: argv.s,
        parentMID: clientConfig.parentMID,
      };

      this.stateConfiguration.clear();
      this.stateConfiguration.set(initState);
    } catch (err) {
      console.log(err);
    }
  }


  update(update) {
    if (!update.key)
      throw new Error('Key required')

    if (!update.value)
      throw new Error('Value required')

    return this.stateConfiguration.set(update.key, update.value)
  }

  deleteKey(argv) {
    return this.stateConfiguration.has(argv.d) ? this.stateConfiguration.delete(argv.d) : null;
  }

  clear() {
    return this.stateConfiguration.clear();
  }

}


