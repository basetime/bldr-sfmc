"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEditableFilesBasedOnContext = void 0;
const CreateLocalFiles_1 = require("./contentBuilder/CreateLocalFiles");
const CreateLocalFiles_2 = require("./automationStudio/CreateLocalFiles");
const CreateLocalFiles_3 = require("./dataExtension/CreateLocalFiles");
const createEditableFilesBasedOnContext = (context, assets) => {
    switch (context) {
        case 'contentBuilder':
            return (0, CreateLocalFiles_1.createContentBuilderEditableFiles)(assets);
        case 'automationStudio':
            return (0, CreateLocalFiles_2.createAutomationStudioEditableFiles)(assets);
        case 'dataExtension':
            return (0, CreateLocalFiles_3.createEmailStudioEditableFiles)(assets);
    }
};
exports.createEditableFilesBasedOnContext = createEditableFilesBasedOnContext;
