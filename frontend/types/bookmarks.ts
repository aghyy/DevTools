export interface Bookmark {
  id: number;
  userId: number;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  tags: string[];
  favicon: string | null;
  screenshotUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkFormData {
  title: string;
  url: string;
  description?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface BookmarkCategory {
  name: string;
  count: number;
}

export interface BookmarkTag {
  tag: string;
  count: number;
}

export interface PublicBookmarks {
  username: string;
  firstName: string;
  lastName: string;
  bookmarks: Bookmark[];
} 