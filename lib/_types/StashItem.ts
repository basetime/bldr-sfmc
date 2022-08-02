export interface StashItem {
  path: string;
  bldr: {
    id: number;
    context: string;
    bldrId: string;
    folderPath: string;
  },
  fileContent: string;
}
