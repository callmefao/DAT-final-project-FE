export const formatConfidence = (score?: number) => {
  if (typeof score !== "number" || Number.isNaN(score)) {
    return "N/A";
  }

  const clamped = Math.min(Math.max(score, 0), 1);
  return `${(clamped * 100).toFixed(1)}%`;
};
