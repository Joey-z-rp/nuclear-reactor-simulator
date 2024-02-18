export const getNextOrder = (power: number) => {
  const nextOrderOfMagnitude = Math.floor(Math.log10(power)) + 1;
  return {
    nextOrder: Math.pow(10, nextOrderOfMagnitude),
    nextOrderOfMagnitude,
  };
};

export const getPowerWithUnit = (
  power: number,
  nextOrderOfMagnitude: number
) => {
  if (nextOrderOfMagnitude < -2) {
    return { power: power * 1000000, unit: "µW" };
  } else if (nextOrderOfMagnitude < 1) {
    return { power: power * 1000, unit: "mW" };
  } else if (nextOrderOfMagnitude < 4) {
    return { power, unit: "W" };
  } else if (nextOrderOfMagnitude < 7) {
    return { power: power / 1000, unit: "kW" };
  } else {
    return { power: power / 1000000, unit: "MW" };
  }
};
