const Add = require("./Add");
const Clone = require("./Clone")
const LocalFile = require("./LocalFile");
const Push = require("./Push");
const Search = require("./Search")

module.exports = class Blueprint {
  constructor(bldr, contextMap, store) {
    this.bldr = bldr;
    this.local = new LocalFile(
      contextMap,
      store
    );

    this.clone = new Clone(
      this.bldr,
      this.local,
      contextMap,
      store
    );

    this.search = new Search(
      this.bldr,
      contextMap,
      store
    );

    this.add = new Add(
      this.local,
      contextMap,
      store,
    );

    this.push = new Push(
      this.bldr,
      this.add,
      this.local,
      contextMap,
      store
    );
  }
}