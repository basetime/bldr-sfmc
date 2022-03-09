module.exports.initOptions = () => {
  return {
    interactive: { default: true },
    instance: {
      type: 'input',
      describe: 'SFMC Instance Name',
      prompt: 'always',
    },
    parentMID: {
      type: 'input',
      describe: 'Parent MID',
      prompt: 'always',
    },
    apiClientId: {
      type: 'input',
      describe: 'API Client ID',
      prompt: 'always',
    },
    apiClientSecret: {
      type: 'input',
      describe: 'API Client Secret',
      prompt: 'always',
    },
    instanceSubdomain: {
      type: 'input',
      describe: 'Instance Subdomain',
      prompt: 'always',
    },
  };
};

module.exports.deleteOptions = (instance) => {
  return {
    interactive: { default: true },
    confirmDelete: {
      type: 'confirm',
      describe: `Please confirm deletion of ${instance}`,
      prompt: 'always',
    },
  }
}