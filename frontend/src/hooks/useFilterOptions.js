import { useMemo } from "react";

export function useFilterOptions(list, builders) {
  // builders: { cities: (item)=>string, instruments:(item)=>string[] ... }
  return useMemo(() => {
    const out = {};
    for (const key of Object.keys(builders)) out[key] = new Set();

    for (const item of list) {
      for (const [key, fn] of Object.entries(builders)) {
        const v = fn(item);
        if (Array.isArray(v)) v.forEach((x) => x && out[key].add(String(x)));
        else if (v) out[key].add(String(v));
      }
    }

    const finalOut = {};
    for (const [key, set] of Object.entries(out)) {
      finalOut[key] = [...set].sort((a, b) => a.localeCompare(b));
    }
    return finalOut;
  }, [list, builders]);
}
