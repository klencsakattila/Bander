import { useCallback, useEffect, useRef, useState } from "react";

export function useInfiniteList({
  enabled = true,
  fetchPage, // async () => array
  getId = (x) => x?.id,
  maxTriesPerLoad = 5,
  rootMargin = "300px",
} = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(enabled));
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");

  const bottomRef = useRef(null);

  // refs to avoid dependency loops
  const fetchPageRef = useRef(fetchPage);
  const getIdRef = useRef(getId);
  const enabledRef = useRef(enabled);

  const seenIdsRef = useRef(new Set());
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // keep refs fresh without re-triggering effects
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  useEffect(() => {
    getIdRef.current = getId;
  }, [getId]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const reset = useCallback(() => {
    seenIdsRef.current = new Set();
    setItems([]);
    setHasMore(true);
    setError("");
    hasMoreRef.current = true;
  }, []);

  const loadMore = useCallback(async ({ initial = false } = {}) => {
    if (!enabledRef.current) return;
    if (!hasMoreRef.current && !initial) return;
    if (loadingRef.current) return;

    loadingRef.current = true;

    try {
      if (initial) setLoading(true);
      else setLoadingMore(true);

      setError("");

      let newOnes = [];
      let tries = 0;

      while (newOnes.length === 0 && tries < maxTriesPerLoad) {
        tries += 1;

        const data = await fetchPageRef.current();
        const list = Array.isArray(data) ? data : [];

        const unseen = list.filter((x) => {
          const id = getIdRef.current(x);
          if (id === null || id === undefined) return false;
          if (seenIdsRef.current.has(id)) return false;
          return true;
        });

        if (unseen.length) newOnes = unseen;
      }

      if (!newOnes.length) {
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }

      for (const x of newOnes) {
        const id = getIdRef.current(x);
        if (id !== null && id !== undefined) seenIdsRef.current.add(id);
      }

      setItems((prev) => [...prev, ...newOnes]);
    } catch (e) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, [maxTriesPerLoad]);

  // initial load when enabled flips true (and on token change etc. from caller)
  useEffect(() => {
    if (!enabled) return;
    reset();
    loadMore({ initial: true });
  }, [enabled, reset, loadMore]);

  // IntersectionObserver: set up once
  useEffect(() => {
    const el = bottomRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          // only load if we are allowed
          if (!loadingRef.current && hasMoreRef.current && enabledRef.current) {
            loadMore({ initial: false });
          }
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, rootMargin]);

  return {
    items,
    setItems,
    loading,
    loadingMore,
    hasMore,
    error,
    bottomRef,
    reset,
    loadMore,
  };
}
