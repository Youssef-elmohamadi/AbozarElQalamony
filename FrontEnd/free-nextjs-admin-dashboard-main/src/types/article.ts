export interface ArticleItem {
  id: number;
  title: string;
  description: string | null;
  body: string;
  publishDate: string | null;
  createdAt: string;
}

export interface CreateArticleInput {
  title: string;
  description?: string | null;
  body: string;
  publishDate?: string | null;
}

export interface UpdateArticleInput {
  title: string;
  description?: string | null;
  body: string;
  publishDate?: string | null;
}
