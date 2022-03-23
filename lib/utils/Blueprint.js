const bldr  = require("./bldr_index");
const Blueprint = require("./Blueprint/index");

module.exports.set = (mid = null) => new Blueprint(bldr(mid));

