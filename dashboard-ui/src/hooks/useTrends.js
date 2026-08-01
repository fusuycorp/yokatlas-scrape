import { useState, useEffect } from 'react';
import { uniatlasService } from '../api/uniatlasService';
import { DEFAULT_TREND_PROGRAM_CODE } from '../constants/university';

export function useTrends(initialProgramCode = DEFAULT_TREND_PROGRAM_CODE) {
  const [progCode, setProgCode] = useState(initialProgramCode);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!progCode) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    uniatlasService
      .getProgramTrends(progCode)
      .then((res) => {
        if (isMounted) {
          setData(res);
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
  }, [progCode]);

  return {
    progCode,
    setProgCode,
    data,
    loading,
    error,
  };
}
