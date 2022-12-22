export interface FilePathDetails {
    fileName: string;
    fileExtension: string;
    folderPath: string;
    folderName: string;
    context: {
        name: string;
        context: string;
        contentType: string;
    };
}
