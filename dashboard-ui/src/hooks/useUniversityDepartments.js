import { useState, useEffect, useMemo } from 'react';
import { uniatlasService } from '../api/uniatlasService';

export function useUniversityDepartments(uniName) {
  const [university, setUniversity] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [scoreType, setScoreType] = useState('');
  const [sortBy, setSortBy] = useState('basariSirasi');
  const [sortDir, setSortDir] = useState('ASC');

  useEffect(() => {
    if (!uniName) {
      setUniversity(null);
      setDepartments([]);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    uniatlasService
      .getUniversityDepartments(uniName)
      .then((data) => {
        if (isMounted) {
          setUniversity(data.university || null);
          setDepartments(data.departments || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [uniName]);

  const filteredDepartments = useMemo(() => {
    let result = [...departments];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.birimAdi?.toLowerCase().includes(q) ||
          d.fymkAdi?.toLowerCase().includes(q) ||
          d.kilavuzKodu?.toString().includes(q)
      );
    }

    if (scoreType) {
      result = result.filter((d) => d.puanTuru === scoreType);
    }

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDir === 'ASC' ? -1 : 1;
      if (valA > valB) return sortDir === 'ASC' ? 1 : -1;
      return 0;
    });

    return result;
  }, [departments, search, scoreType, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(col);
      setSortDir('ASC');
    }
  };

  return {
    university,
    departments: filteredDepartments,
    rawDepartments: departments,
    loading,
    error,
    search,
    setSearch,
    scoreType,
    setScoreType,
    sortBy,
    sortDir,
    toggleSort,
  };
}
