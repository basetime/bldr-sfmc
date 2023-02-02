module.exports = {
    interactive: { default: true },
    projectName: {
        type: 'input',
        describe: 'Project Name',
        prompt: 'always',
    },
    createConfig: {
        type: 'confirm',
        describe: 'Does your project need environment variables?',
        prompt: 'always',
    },
};
