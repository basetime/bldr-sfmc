const Clone = require("./Clone")
const LocalFile = require("./LocalFile")
const Search = require("./Search")

module.exports = class Blueprint {
  constructor(bldr, mid) {
    this.local = new LocalFile();
    this.bldr = bldr;
    this.clone = new Clone(this.bldr, this.local);
    this.search = new Search(this.bldr);
  }
}