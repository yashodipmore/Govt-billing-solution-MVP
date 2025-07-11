import { FileSearchResult } from "./local-service";

export interface ListItem {
  key: string;
  title: string;
  date: string;
  metadata?: any;
}

export class ListManager {
  static filterFiles(files: FileSearchResult[], filterType: string): FileSearchResult[] {
    switch (filterType) {
      case 'recent':
        return files.slice(0, 10);
      case 'all':
      default:
        return files;
    }
  }

  static sortFiles(files: FileSearchResult[], sortBy: string): FileSearchResult[] {
    switch (sortBy) {
      case 'name':
        return [...files].sort((a, b) => a.key.localeCompare(b.key));
      case 'date':
        return [...files].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'relevance':
        return [...files].sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
      default:
        return files;
    }
  }

  static convertToListItems(files: FileSearchResult[]): ListItem[] {
    return files.map(file => ({
      key: file.key,
      title: file.key,
      date: file.date,
      metadata: file.content
    }));
  }
}
