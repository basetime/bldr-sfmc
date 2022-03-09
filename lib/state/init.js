const yargsInteractive = require("yargs-interactive");
const configInit = require("../config/init");

const Conf = require("conf");

const state = new Conf({
  configName: `sfmc__stateManagement`,
});

module.exports.updateState = (update) => state.set(update.key, update.value);
module.exports.deleteStateKey = (argv) =>
  state.has(argv.d) ? state.delete(argv.d) : null;
module.exports.clearState = () => state.clear();

module.exports.getState = (show, key) => {
  try {
    if (!key)
      return show
        ? console.log(Object.assign({}, state.get()))
        : Object.assign({}, state.get());
    if (key && state.has(key))
      return show
        ? console.log(Object.assign({}, state.get(key)))
        : Object.assign({}, state.get(key));
  } catch (err) {
    console.log(err);
  }
};

module.exports.setClient = (argv) => {
  try {
    if (typeof argv.s !== "string")
      throw new Error("Please provide an instance to set.");

    const currentState = this.getState();
    if (currentState && currentState.instance === argv.s)
      return console.log(`${argv.s} is already set.`);

    const clientConfig = configInit.getConfiguration(argv.s);
    const initState = {
      instance: argv.s,
      parentMID: clientConfig.parentMID,
    };

    state.set(initState);
  } catch (err) {
    console.log(err);
  }
};
