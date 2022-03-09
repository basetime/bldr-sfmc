
 const chalk = require('chalk')
 
 module.exports.init = () => {
    return {
      styles: {
        header: chalk.bold,
        command: chalk.green,
        dim: chalk.dim,
        detail: chalk.cyan,
      },
      width: {
        c1: 15,
        c2: 30,
        c3: 80
      }
    }
  }