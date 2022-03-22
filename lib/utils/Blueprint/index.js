const Clone = require("./Clone")
const LocalFile = require("./LocalFile")
const Search = require("./Search")

module.exports = class Blueprint {
  constructor(bldr) {
    this.local = new LocalFile();
    this.clone = new Clone(bldr, this.local);
    this.search = new Search(bldr);
  }
}