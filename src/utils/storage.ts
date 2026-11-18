import { BookmarkItem, HistoryItem } from '../types/movie';

const BOOKMARK_KEY = '2phim_bookmarks';
const HISTORY_KEY = '2phim_history';

export const storage = {
  // Bookmarks
  getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(BOOKMARK_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isBookmarked(slug: string): boolean {
    const list = this.getBookmarks();
    return list.some(item => item.slug === slug);
  },

  toggleBookmark(movie: {
    slug: string;
    name: string;
    origin_name: string;
    poster_url: string;
    thumb_url: string;
    year: number;
    episode_current?: string;
    quality?: string;
  }): boolean {
    const list = this.getBookmarks();
    const index = list.findIndex(item => item.slug === movie.slug);
    if (index >= 0) {
      list.splice(index, 1);
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
      return false; // Removed
    } else {
      list.unshift({
        ...movie,
        addedAt: Date.now(),
      });
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list.slice(0, 100)));
      return true; // Added
    }
  },

  removeBookmark(slug: string) {
    const list = this.getBookmarks().filter(item => item.slug !== slug);
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  },

  // Watch History
  getHistory(): HistoryItem[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory(item: Omit<HistoryItem, 'updatedAt'>) {
    try {
      const list = this.getHistory().filter(h => h.slug !== item.slug);
      list.unshift({
        ...item,
        updatedAt: Date.now(),
      });
      // Giới hạn lưu 50 phim gần nhất
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      // Ignored
    }
  },

  removeHistory(slug: string) {
    const list = this.getHistory().filter(h => h.slug !== slug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },

  clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
  }
};
