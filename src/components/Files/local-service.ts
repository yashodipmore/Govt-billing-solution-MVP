import { Local } from "../Storage/LocalStorage";

export interface FileSearchResult {
  key: string;
  content: any;
  date: string;
  relevance?: number;
}

export class LocalService {
  private store: Local;

  constructor(store: Local) {
    this.store = store;
  }

  async getAllFiles(): Promise<FileSearchResult[]> {
    const files = await this.store._getAllFiles();
    return Object.keys(files).map(key => ({
      key,
      content: files[key],
      date: files[key].date || new Date().toISOString(),
      relevance: 1
    }));
  }

  async searchFiles(query: string): Promise<FileSearchResult[]> {
    if (!query.trim()) {
      return this.getAllFiles();
    }

    const allFiles = await this.getAllFiles();
    const searchTerm = query.toLowerCase();

    return allFiles
      .filter(file => 
        file.key.toLowerCase().includes(searchTerm) ||
        JSON.stringify(file.content).toLowerCase().includes(searchTerm)
      )
      .map(file => ({
        ...file,
        relevance: this.calculateRelevance(file, searchTerm)
      }))
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  }

  private calculateRelevance(file: FileSearchResult, searchTerm: string): number {
    let relevance = 0;
    const fileName = file.key.toLowerCase();
    
    if (fileName.includes(searchTerm)) {
      relevance += fileName.startsWith(searchTerm) ? 10 : 5;
    }
    
    return relevance;
  }
}
