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
            context: string;
        };
        bldrId: string;
        folderPath: string;
    };
    fileContent: any;
}

export { StashItem };
