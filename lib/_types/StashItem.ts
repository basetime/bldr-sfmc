interface StashItemPut {
  path: string;
  bldr: {
    id: number;
    context: string;
    bldrId: string;
    folderPath: string;
  };
  fileContent: any;
}

interface StashItemPost {
  path: string;
  create?: Boolean;
  bldr: {
    context: string;
    bldrId: string;
    folderPath: string;
  };
  post: {
    bldrId: string;
    name: string;
    assetType?: {
      id: number;
      name: string;
    };
    category: {
      id?: number;
      name?: string;
      parentId?: number;
      folderPath: string;
    };
    fileContent: any;
  };
}

export { StashItemPut, StashItemPost };
