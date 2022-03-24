const bldr  = require("./bldr_index");
const Blueprint = require("./Blueprint/index");

module.exports.set = async (mid = null) => {
  try {
    const bldrInst = await bldr(mid)

    if(!bldrInst)
      throw new Error('BAD AUTH')

    return new Blueprint(bldrInst);
  } catch (err) {
    throw err
  }
}

