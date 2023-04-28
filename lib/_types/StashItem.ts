interface StashItem {
    name?: string;
    path: string;
    assetType?: {
        name: string;
        id: number;
    };
    bldr: {
        id?: number;
        context: {
            name: string;
            rootName: string;
            context: string;
            contentType: string;
        };
        bldrId: string;
        folderPath: string;
    };
    fileContent: any;
}

export { StashItem };
