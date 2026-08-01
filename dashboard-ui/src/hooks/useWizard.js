import { useState, useEffect, useCallback } from 'react';
import { uniatlasService } from '../api/uniatlasService';

export function useWizard(initialScoreType = 'SAY', initialTargetRank = 25000) {
  const [scoreType, setScoreType] = useState(initialScoreType);
  const [targetRank, setTargetRank] = useState(initialTargetRank);
  const [wizardData, setWizardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(() => {
    if (!targetRank || targetRank <= 0) return;

    setLoading(true);
    setError(null);

    uniatlasService
      .getWizardRecommendations(scoreType, targetRank, 12)
      .then((data) => {
        setWizardData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [scoreType, targetRank]);

  useEffect(() => {
    fetchRecommendations();
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
