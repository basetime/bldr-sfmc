"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditSelection = void 0;
const auditSelection = () => ({
    interactive: { default: true },
    auditSelection: {
        type: 'checkbox',
        describe: 'What SFMC Contexts would you like to audit?',
        choices: [
            'Content Builder',
            'Data Extensions',
            'Automation Studio',
            'Journey Builder',
            'Email Send Definitions',
            'Extract Definitions',
            'File Triggers',
            'Filter Definitions',
            'Import Definitions',
            'Query Definitions',
            'Triggered Send Definitions',
            'Event Definitions',
            'Attribute Set Definitions',
        ],
        prompt: 'always',
    },
});
exports.auditSelection = auditSelection;
