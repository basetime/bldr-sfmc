const { init } = require("./bldr_index");
const Blueprint = require("./Blueprint/index");
const contextMap = require("../utils/contextMap");

module.exports.set = async (mid = null, store) => {
  try {
    const bldrInst = await init(mid, store)

    if (!bldrInst)
      throw new Error('Unable to initiate the sfmc sdk')

    return new Blueprint(
      bldrInst,
      contextMap,
      store
    );

  } catch (err) {
    throw err
  }
}

