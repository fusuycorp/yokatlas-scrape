import { useState, useEffect, useCallback, useRef } from 'react';
import { uniatlasService } from '../api/uniatlasService';

export function useWizard(initialScoreType = 'SAY', initialTargetRank = 25000) {
  const [scoreType, setScoreType] = useState(initialScoreType);
  const [targetRank, setTargetRank] = useState(initialTargetRank);
  const [wizardData, setWizardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Monotonic request id so an out-of-order response can never overwrite a newer one.
  const requestIdRef = useRef(0);

  const fetchRecommendations = useCallback(() => {
    if (!targetRank || targetRank <= 0) return;

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    uniatlasService
      .getWizardRecommendations(scoreType, targetRank, 12)
      .then((data) => {
        if (requestId === requestIdRef.current) {
          setWizardData(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (requestId === requestIdRef.current) {
          setError(err.message);
          setLoading(false);
        }
      });
  }, [scoreType, targetRank]);

  useEffect(() => {
    fetchRecommendations();
    // Invalidate any in-flight request on unmount / when deps change.
    return () => {
      requestIdRef.current += 1;
    };
  }, [fetchRecommendations]);

  return {
    scoreType,
    setScoreType,
    targetRank,
    setTargetRank,
    wizardData,
    loading,
    error,
    fetchRecommendations,
  };
}
