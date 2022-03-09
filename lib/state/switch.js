const init = require('./init');
const write = true;

module.exports.switch = (req, argv) => {
  if(argv.c) init.clearState();

  if(argv.d) init.deleteStateKey(argv)

  init.getState(write);
};
