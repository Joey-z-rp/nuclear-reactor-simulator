export const multiplyArray = (array: number[], multiplier: number) =>
  array.map((num) => num * multiplier);

export const addArrays = (
  array1: number[],
  array2: number[],
  { positiveOnly = false } = {}
) =>
  array1.map((num, index) => {
    const sum = num + array2[index];
    return positiveOnly ? Math.max(0, sum) : sum;
  });
