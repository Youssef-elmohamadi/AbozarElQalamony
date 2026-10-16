export interface SiteAlertItem {
  id: number;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateSiteAlertInput {
  title: string;
  content: string;
  isActive?: boolean;
}

export interface UpdateSiteAlertInput {
  title: string;
  content: string;
  isActive: boolean;
}
