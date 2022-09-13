import { createContentBuilderEditableFiles } from './contentBuilder/CreateLocalFiles';
import { createAutomationStudioEditableFiles } from './automationStudio/CreateLocalFiles';
import { createEmailStudioEditableFiles } from './dataExtension/CreateLocalFiles';

const createEditableFilesBasedOnContext = (context: string, assets: any[]) => {
    switch (context) {
        case 'contentBuilder':
            return createContentBuilderEditableFiles(assets);
        case 'automationStudio':
            return createAutomationStudioEditableFiles(assets);
        case 'dataExtension':
            return createEmailStudioEditableFiles(assets);
    }
};

export { createEditableFilesBasedOnContext };
