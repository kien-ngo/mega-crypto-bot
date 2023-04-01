export const formatNumber = (num: number): string => {
  const million = 1000000;
  const billion = 1000000000;

  if (num >= billion) {
    const numB = (num / billion).toFixed(1);
    return `${numB}B`;
  } else if (num >= million) {
    const numM = (num / million).toFixed(1);
    return `${numM}M`;
  } else {
    return num.toString();
  }
};
