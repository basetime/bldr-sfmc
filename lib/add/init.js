const yargsInteractive = require("yargs-interactive");
const fs = require('fs')
const path = require('path')

const getFiles = require("node-recursive-directory")

const utils = require("../utils/utils");
const Conf = require("conf");

let config = new Conf();



module.exports.init = () => {
  console.log('add')
};


module.exports.addAll = async () => {

  let files = await getFiles('./', false); // add true
  files.map((file) => {
    const splitFile = file.split('Content Builder')
    console.log(splitFile)
  })

  return files
}