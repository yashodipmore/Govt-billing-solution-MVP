import { FileSearchResult } from './local-service';

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  date: string;
  type: string;
  relevance?: number;
  metadata?: any;
}

export interface ListFilter {
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
  billType?: number;
}

export interface ListSortOptions {
  field: 'name' | 'date' | 'relevance' | 'type';
  direction: 'asc' | 'desc';
}

export class ListManager {
  private items: ListItem[] = [];
  private filteredItems: ListItem[] = [];
  private currentFilter: ListFilter = {};
  private currentSort: ListSortOptions = { field: 'date', direction: 'desc' };

  /**
   * Convert FileSearchResult to ListItem
   */
  static fileToListItem(file: FileSearchResult): ListItem {
    return {
      id: file.name,
      name: file.name,
      description: `Bill Type: ${file.billType}`,
      date: file.modified,
      type: `bill-${file.billType}`,
      relevance: file.relevanceScore,
      metadata: {
        created: file.created,
        billType: file.billType,
        contentLength: file.content.length
      }
    };
  }

  /**
   * Set the list items
   */
  setItems(items: ListItem[]): void {
    this.items = [...items];
    this.applyFilterAndSort();
  }

  /**
   * Add items from FileSearchResult array
   */
  setItemsFromFiles(files: FileSearchResult[]): void {
    const items = files.map(file => ListManager.fileToListItem(file));
    this.setItems(items);
  }

  /**
   * Get current filtered and sorted items
   */
  getItems(): ListItem[] {
    return [...this.filteredItems];
  }

  /**
   * Get all items (unfiltered)
   */
  getAllItems(): ListItem[] {
    return [...this.items];
  }

  /**
   * Apply filter to items
   */
  setFilter(filter: ListFilter): void {
    this.currentFilter = { ...filter };
    this.applyFilterAndSort();
  }

  /**
   * Get current filter
   */
  getFilter(): ListFilter {
    return { ...this.currentFilter };
  }

  /**
   * Apply sort to items
   */
  setSort(sort: ListSortOptions): void {
    this.currentSort = { ...sort };
    this.applyFilterAndSort();
  }

  /**
   * Get current sort options
   */
  getSort(): ListSortOptions {
    return { ...this.currentSort };
  }

  /**
   * Clear all filters
   */
  clearFilter(): void {
    this.currentFilter = {};
    this.applyFilterAndSort();
  }

  /**
   * Search items by name and description
   */
  search(query: string): void {
    this.currentFilter.searchTerm = query;
    this.applyFilterAndSort();
  }

  /**
   * Get item by ID
   */
  getItemById(id: string): ListItem | undefined {
    return this.items.find(item => item.id === id);
  }

  /**
   * Get items count
   */
  getItemsCount(): { total: number; filtered: number } {
    return {
      total: this.items.length,
      filtered: this.filteredItems.length
    };
  }

  /**
   * Get unique types from items
   */
  getUniqueTypes(): string[] {
    const types = new Set(this.items.map(item => item.type));
    return Array.from(types).sort();
  }

  /**
   * Apply current filter and sort to items
   */
  private applyFilterAndSort(): void {
    let filtered = [...this.items];

    // Apply filters
    if (this.currentFilter.type) {
      filtered = filtered.filter(item => item.type === this.currentFilter.type);
    }

    if (this.currentFilter.searchTerm && this.currentFilter.searchTerm.trim()) {
      const searchTerm = this.currentFilter.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        (item.description && item.description.toLowerCase().includes(searchTerm))
      );
    }

    if (this.currentFilter.billType !== undefined) {
      filtered = filtered.filter(item => 
        item.metadata && item.metadata.billType === this.currentFilter.billType
      );
    }

    if (this.currentFilter.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.date) >= this.currentFilter.dateFrom!
      );
    }

    if (this.currentFilter.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.date) <= this.currentFilter.dateTo!
      );
    }

    // Apply sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (this.currentSort.field) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'relevance':
          aValue = a.relevance || 0;
          bValue = b.relevance || 0;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) {
        return this.currentSort.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.currentSort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredItems = filtered;
  }

  /**
   * Get items grouped by type
   */
  getItemsGroupedByType(): { [type: string]: ListItem[] } {
    const grouped: { [type: string]: ListItem[] } = {};
    
    this.filteredItems.forEach(item => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });

    return grouped;
  }

  /**
   * Get items grouped by date (day)
   */
  getItemsGroupedByDate(): { [date: string]: ListItem[] } {
    const grouped: { [date: string]: ListItem[] } = {};
    
    this.filteredItems.forEach(item => {
      const dateKey = new Date(item.date).toDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });

    return grouped;
  }

  /**
   * Export current filtered items as JSON
   */
  exportToJSON(): string {
    return JSON.stringify({
      items: this.filteredItems,
      filter: this.currentFilter,
      sort: this.currentSort,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get statistics about current items
   */
  getStatistics(): {
    totalItems: number;
    filteredItems: number;
    typeDistribution: { [type: string]: number };
    averageRelevance: number;
    dateRange: { earliest: Date | null; latest: Date | null };
  } {
    const stats = {
      totalItems: this.items.length,
      filteredItems: this.filteredItems.length,
      typeDistribution: {} as { [type: string]: number },
      averageRelevance: 0,
      dateRange: { earliest: null as Date | null, latest: null as Date | null }
    };

    // Calculate type distribution
    this.filteredItems.forEach(item => {
      stats.typeDistribution[item.type] = (stats.typeDistribution[item.type] || 0) + 1;
    });

    // Calculate average relevance
    if (this.filteredItems.length > 0) {
      const totalRelevance = this.filteredItems.reduce((sum, item) => sum + (item.relevance || 0), 0);
      stats.averageRelevance = totalRelevance / this.filteredItems.length;
    }

    // Calculate date range
    if (this.filteredItems.length > 0) {
      const dates = this.filteredItems.map(item => new Date(item.date));
      stats.dateRange.earliest = new Date(Math.min(...dates.map(d => d.getTime())));
      stats.dateRange.latest = new Date(Math.max(...dates.map(d => d.getTime())));
    }

    return stats;
  }
}
