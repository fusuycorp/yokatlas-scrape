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

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    uniatlasService
      .getProgramTrends(progCode, { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) {
          setData(res);
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
  }, [progCode]);

  return {
    progCode,
    setProgCode,
    data,
    loading,
    error,
  };
}
