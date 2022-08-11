interface StashItem {
    name?: string;
    path: string;
    bldr: {
        id?: number;
        context: {
            context: string;
        };
        bldrId: string;
        folderPath: string;
    };
    post?: {
        bldrId: string;
        name: string;
        assetType?: {
            id: number;
            name: string;
        };
        category?: {
            id?: number;
            name?: string;
            parentId?: number;
            folderPath: string;
        };
        fileContent: any;
    };
    fileContent?: any;
}

export { StashItem };
