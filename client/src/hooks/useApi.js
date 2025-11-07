import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook to prevent duplicate API calls
 * @param {Function} apiFunction - The API function to call
 * @param {Array} dependencies - Dependencies array (default: [])
 * @returns {Object} { data, loading, error, refetch }
 */
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const isCallingRef = useRef(false);
  const lastCallTimeRef = useRef(0);

  const fetchData = async () => {
    // Prevent duplicate calls within 500ms
    const now = Date.now();
    if (isCallingRef.current || (now - lastCallTimeRef.current < 500)) {
      console.log('⚠️ API call throttled, skipping...');
      return;
    }

    try {
      isCallingRef.current = true;
      lastCallTimeRef.current = now;
      setLoading(true);
      setError(null);

      const result = await apiFunction();

      if (isMountedRef.current) {
        if (result && result.success) {
          setData(result);
        } else {
          setError(result?.error || 'Failed to fetch data');
        }
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message || 'An error occurred');
        setLoading(false);
      }
    } finally {
      isCallingRef.current = false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};