interface ManifestAsset {
    id: number;
    name: string;
    bldrId: string;
    category: {
        folderPath: string;
    };
}

interface ManifestFolder {
    id: number;
    name: string;
    parentId: number;
    folderPath: string;
}

export { ManifestAsset, ManifestFolder };
