"use client";

import { useCallback, useEffect, useState } from "react";
import type { DependencyList } from "react";

export function useSupabaseQuery<T>(query: () => Promise<T>, dependencies: DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await query();
      setData(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unknown data error");
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload };
}
