const bldr = require("./bldr_index");
const Blueprint = require("./Blueprint/index");
const contextMap = require("../utils/contextMap");

module.exports.set = async (mid = null, store) => {
  try {
    const bldrInst = await bldr(mid, store)

    if (!bldrInst)
      throw new Error('BAD AUTH')

    return new Blueprint(
      bldrInst,
      contextMap,
      store
    );

  } catch (err) {
    throw err
  }
}
