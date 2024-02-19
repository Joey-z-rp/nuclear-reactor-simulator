export const round = (num: number, decimal: number = 2) => {
  const factor = Math.pow(10, decimal);
  return Math.round(num * factor) / factor;
};
