export function normalizeStringArray(val) {
  if (!val) return [];

  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return normalizeStringArray(parsed);
    } catch {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  if (Array.isArray(val)) {
    return val
      .map((x) => {
        if (typeof x === "string") return x;
        return x?.name ?? x?.instrument ?? x?.title ?? "";
      })
      .filter(Boolean);
  }

  if (typeof val === "object") {
    const one = val.name ?? val.instrument ?? val.title;
    return one ? [one] : [];
  }

  return [String(val)];
}
