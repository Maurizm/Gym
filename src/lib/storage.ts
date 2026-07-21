export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      if (typeof window === 'undefined') return fallback;
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T): boolean {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
};
