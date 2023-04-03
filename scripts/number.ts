export const formatNumber = (num: number): string => {
  if (!num) return "N/A";
  const thousand = 100_000;
  const million = 1_000_000;
  const billion = 1_000_000_000;
  const trillion = 1_000_000_000_000;
  if (num >= trillion) {
    const numB = (num / trillion).toFixed(1);
    return `${numB}T`;
  } else if (num >= billion) {
    const numB = (num / billion).toFixed(1);
    return `${numB}B`;
  } else if (num >= million) {
    const numM = (num / million).toFixed(1);
    return `${numM}M`;
  } else if (num >= thousand) {
    const numM = (num / thousand).toFixed(1);
    return `${numM}K`;
  } else {
    return num.toString();
  }
};
