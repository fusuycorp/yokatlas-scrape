import { useState, useEffect } from 'react';
import { uniatlasService } from '../api/uniatlasService';
import { DEFAULT_COMPARE_UNIVERSITIES } from '../constants/university';

export function useCompare(initialUnis = DEFAULT_COMPARE_UNIVERSITIES) {
  const [allUnis, setAllUnis] = useState([]);
  const [selectedUnis, setSelectedUnis] = useState(initialUnis);
  const [comparisonData, setComparisonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load university master list once for dropdown
  useEffect(() => {
    uniatlasService
      .getUniversities()
      .then((data) => setAllUnis(data.universities || []))
      .catch((err) => console.error('Error fetching university list:', err));
  }, []);

  // Fetch comparative data when selected Unis change
  useEffect(() => {
    if (!selectedUnis || selectedUnis.length < 2) return;

    let isMounted = true;
    setLoading(true);

    uniatlasService
      .compareUniversities(selectedUnis)
      .then((data) => {
        if (isMounted) {
          setComparisonData(data);
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
  }, [selectedUnis]);

  const addUniversity = (name) => {
    if (!selectedUnis.includes(name) && selectedUnis.length < 4) {
      setSelectedUnis((prev) => [...prev, name]);
    }
  };

  const removeUniversity = (name) => {
    if (selectedUnis.length > 2) {
      setSelectedUnis((prev) => prev.filter((u) => u !== name));
    }
  };

  return {
    allUnis,
    selectedUnis,
    comparisonData,
    loading,
    error,
    addUniversity,
    removeUniversity,
  };
}
