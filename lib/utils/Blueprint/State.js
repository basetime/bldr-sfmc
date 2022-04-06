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
      const instanceToSet = argv.s || argv.set;
      const midToSet = argv.m || argv.mid;

      if (typeof instanceToSet !== "string")
        throw new Error("Please provide an Instance Name to Set.");

      const currentState = this.get();

      const clientConfig = this.coreConfiguration.get(instanceToSet);
      const initState = {
        instance: instanceToSet,
        parentMID: clientConfig.parentMID,
        activeMID: midToSet || clientConfig.parentMID
      };

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


