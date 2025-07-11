import { Local, File } from './LocalStorage';

export interface FileSearchResult {
  name: string;
  content: string;
  created: string;
  modified: string;
  billType: number;
  relevanceScore: number;
}

export class LocalService {
  private storage: Local;

  constructor() {
    this.storage = new Local();
  }

  /**
   * Get all files from local storage
   * @returns Promise<File[]> - Array of all files
   */
  async getAllFiles(): Promise<File[]> {
    try {
      const filesData = await this.storage._getAllFiles();
      const files: File[] = [];
      
      for (const fileName of Object.keys(filesData)) {
        try {
          const fileData = await this.storage._getFile(fileName);
          const file = new File(
            fileData.created,
            fileData.modified,
            fileData.content,
            fileData.name,
            fileData.billType
          );
          files.push(file);
        } catch (error) {
          console.warn(`Failed to load file: ${fileName}`, error);
        }
      }
      
      return files.sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());
    } catch (error) {
      console.error('Error getting all files:', error);
      return [];
    }
  }

  /**
   * Search files by name and content
   * @param query - Search query string
   * @returns Promise<FileSearchResult[]> - Array of matching files with relevance scores
   */
  async searchFiles(query: string): Promise<FileSearchResult[]> {
    if (!query || query.trim().length === 0) {
      const allFiles = await this.getAllFiles();
      return allFiles.map(file => ({
        ...file,
        relevanceScore: 1
      }));
    }

    const files = await this.getAllFiles();
    const searchResults: FileSearchResult[] = [];
    const searchTerm = query.toLowerCase().trim();

    files.forEach(file => {
      let relevanceScore = 0;
      const fileName = file.name.toLowerCase();
      const fileContent = file.content.toLowerCase();

      // Check exact name match (highest priority)
      if (fileName === searchTerm) {
        relevanceScore += 100;
      }
      // Check if filename starts with search term
      else if (fileName.startsWith(searchTerm)) {
        relevanceScore += 80;
      }
      // Check if filename contains search term
      else if (fileName.includes(searchTerm)) {
        relevanceScore += 60;
      }

      // Check content matches
      if (fileContent.includes(searchTerm)) {
        relevanceScore += 40;
      }

      // Check for partial word matches in filename
      const fileNameWords = fileName.split(/[\s\-_\.]+/);
      fileNameWords.forEach(word => {
        if (word.includes(searchTerm)) {
          relevanceScore += 20;
        }
      });

      // Only include files with some relevance
      if (relevanceScore > 0) {
        searchResults.push({
          ...file,
          relevanceScore
        });
      }
    });

    // Sort by relevance score (highest first), then by modification date
    return searchResults.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.modified).getTime() - new Date(a.modified).getTime();
    });
  }

  /**
   * Get file suggestions based on partial input
   * @param partial - Partial filename input
   * @returns Promise<string[]> - Array of suggested filenames
   */
  async getFileSuggestions(partial: string): Promise<string[]> {
    if (!partial || partial.trim().length === 0) {
      return [];
    }

    const files = await this.getAllFiles();
    const suggestions: string[] = [];
    const searchTerm = partial.toLowerCase().trim();

    files.forEach(file => {
      const fileName = file.name.toLowerCase();
      if (fileName.includes(searchTerm) && !suggestions.includes(file.name)) {
        suggestions.push(file.name);
      }
    });

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }

  /**
   * Get files by bill type
   * @param billType - Bill type number
   * @returns Promise<File[]> - Array of files with matching bill type
   */
  async getFilesByBillType(billType: number): Promise<File[]> {
    const files = await this.getAllFiles();
    return files.filter(file => file.billType === billType);
  }

  /**
   * Get recent files (last 10 modified)
   * @returns Promise<File[]> - Array of recent files
   */
  async getRecentFiles(): Promise<File[]> {
    const files = await this.getAllFiles();
    return files.slice(0, 10); // Already sorted by modification date in getAllFiles
  }

  /**
   * Get file statistics
   * @returns Promise<object> - Statistics about files
   */
  async getFileStats(): Promise<{
    totalFiles: number;
    billTypes: { [key: number]: number };
    totalSize: number;
    oldestFile: Date | null;
    newestFile: Date | null;
  }> {
    const files = await this.getAllFiles();
    const stats = {
      totalFiles: files.length,
      billTypes: {} as { [key: number]: number },
      totalSize: 0,
      oldestFile: null as Date | null,
      newestFile: null as Date | null
    };

    if (files.length === 0) {
      return stats;
    }

    files.forEach(file => {
      // Count bill types
      stats.billTypes[file.billType] = (stats.billTypes[file.billType] || 0) + 1;
      
      // Calculate total size (approximate)
      stats.totalSize += file.content.length;

      // Track oldest and newest files
      const fileDate = new Date(file.modified);
      if (!stats.oldestFile || fileDate < stats.oldestFile) {
        stats.oldestFile = fileDate;
      }
      if (!stats.newestFile || fileDate > stats.newestFile) {
        stats.newestFile = fileDate;
      }
    });

    return stats;
  }
}
