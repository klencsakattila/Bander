import { useEffect, useState } from "react";

export function useLoadById(id, loader, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
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
          setError(String(e?.message || "Not found"));
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (id) load();
    else {
      setData(null);
      setLoading(false);
      setError("");
    }

    return () => {
      cancelled = true;
    };
    // IMPORTANT: don't depend on loader identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ...deps]);

  return { data, loading, error };
}
