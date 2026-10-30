import { useState, useEffect } from 'react';
import { uniatlasService } from '../api/uniatlasService';
import { PAGINATION_DEFAULTS } from '../constants/config';

// Module-level cache to persist state across unmounts
const globalFiltersCache = {
  page: PAGINATION_DEFAULTS.PAGE,
  search: '',
  scoreType: '',
  uniType: '',
  city: '',
  sortBy: 'basariSirasi',
  sortDir: 'ASC',
  limit: PAGINATION_DEFAULTS.LIMIT || 25,
};

export function usePrograms(initialFilters = {}) {
  const [programs, setPrograms] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(initialFilters.page || globalFiltersCache.page);
  const [search, setSearch] = useState(initialFilters.search || globalFiltersCache.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || globalFiltersCache.search);
  const [scoreType, setScoreType] = useState(initialFilters.scoreType || globalFiltersCache.scoreType);
  const [uniType, setUniType] = useState(initialFilters.uniType || globalFiltersCache.uniType);
  const [city, setCity] = useState(initialFilters.city || globalFiltersCache.city);
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || globalFiltersCache.sortBy);
  const [sortDir, setSortDir] = useState(initialFilters.sortDir || globalFiltersCache.sortDir);
  const [limit, setLimit] = useState(initialFilters.limit || globalFiltersCache.limit);

  // Debounce search input by 250ms (instant clear on empty string)
  useEffect(() => {
    if (!search) {
      setDebouncedSearch('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Update global cache whenever state changes
  useEffect(() => {
    globalFiltersCache.page = page;
    globalFiltersCache.search = search;
    globalFiltersCache.scoreType = scoreType;
    globalFiltersCache.uniType = uniType;
    globalFiltersCache.city = city;
    globalFiltersCache.sortBy = sortBy;
    globalFiltersCache.sortDir = sortDir;
    globalFiltersCache.limit = limit;
  }, [page, search, scoreType, uniType, city, sortBy, sortDir, limit]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    uniatlasService
      .getPrograms(
        {
          page,
          limit,
          sort_by: sortBy,
          sort_dir: sortDir,
          search: debouncedSearch,
          score_type: scoreType,
          uni_type: uniType,
          city,
        },
        { signal: controller.signal }
      )
      .then((data) => {
        if (!controller.signal.aborted) {
          setPrograms(data.programs || []);
          setTotalCount(data.total || 0);
          setTotalPages(data.total_pages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        setError(err.message);
        setLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [page, limit, debouncedSearch, scoreType, uniType, city, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(col);
      setSortDir('ASC');
    }
  };

  return {
    programs,
    totalCount,
    totalPages,
    loading,
    error,
    page,
    setPage,
    search,
    setSearch,
    scoreType,
    setScoreType,
    uniType,
    setUniType,
    city,
    setCity,
    sortBy,
    sortDir,
    toggleSort,
    limit,
    setLimit,
  };
}
