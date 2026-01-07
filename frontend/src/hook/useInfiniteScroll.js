import { useEffect, useRef } from "react";

export default function useInfiniteScroll({
  enabled = true,
  loading = false,
  onLoadMore,
  root = null,
  rootMargin = "400px",
  threshold = 0,
}) {
  const sentinelRef = useRef(null);
  const lockRef = useRef(false);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || lockRef.current) return;

        lockRef.current = true;
        try {
          await onLoadMoreRef.current?.();
        } finally {
          lockRef.current = false;
        }
      },
      { root, rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, loading, root, rootMargin, threshold]);

  return sentinelRef;
}
