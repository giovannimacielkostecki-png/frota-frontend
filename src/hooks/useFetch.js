// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const executar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.erro || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { executar(); }, [executar]);

  return { data, loading, error, refetch: executar };
}

// Hook para mutations (POST/PUT/DELETE)
export function useMutation(mutFn) {
  const [loading, setLoading] = useState(false);

  async function executar(...args) {
    setLoading(true);
    try {
      const res = await mutFn(...args);
      return res.data;
    } finally {
      setLoading(false);
    }
  }

  return { executar, loading };
}
