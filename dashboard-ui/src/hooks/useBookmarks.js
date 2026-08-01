import { useState, useEffect, useMemo } from 'react';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Custom hook to manage persisted preference list in LocalStorage.
 */
export function useBookmarks() {
  const [savedPrograms, setSavedPrograms] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse bookmarks from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(savedPrograms));
    } catch (e) {
      console.error('Failed to save bookmarks to localStorage:', e);
    }
  }, [savedPrograms]);

  const bookmarkedIds = useMemo(
    () => new Set(savedPrograms.map((p) => p.kilavuzKodu)),
    [savedPrograms]
  );

  const toggleBookmark = (program) => {
    if (bookmarkedIds.has(program.kilavuzKodu)) {
      setSavedPrograms((prev) => prev.filter((p) => p.kilavuzKodu !== program.kilavuzKodu));
    } else {
      setSavedPrograms((prev) => [...prev, program]);
    }
  };

  const removeBookmark = (code) => {
    setSavedPrograms((prev) => prev.filter((p) => p.kilavuzKodu !== code));
  };

  const clearAllBookmarks = () => {
    setSavedPrograms([]);
  };

  return {
    savedPrograms,
    bookmarkedIds,
    toggleBookmark,
    removeBookmark,
    clearAllBookmarks,
  };
}
