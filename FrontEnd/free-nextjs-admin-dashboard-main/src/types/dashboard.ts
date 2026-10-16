export interface MediaStats {
  videoLessons: number;
  audioOnlyLessons: number;
}

export interface DashboardStats {
  totalCategories: number;
  emptyCategories: number;
  totalBooks: number;
  totalLessons: number;
  totalSermons: number;
  totalArticles: number;
  contentAddedThisMonth: number;
  scheduledContent: number;
  mediaStats: MediaStats;
  totalActiveAlerts: number;
}
