import { useEffect, useState } from "react";

export function useLoadById(id, loader) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await loader(id);
        const row = Array.isArray(result) ? result[0] : result;

        if (!row) throw new Error("Not found");
        if (!cancelled) setData(row);
      } catch (e) {
        if (!cancelled) {
          setError("Not found");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id, loader]);

  return { data, loading, error };
}
