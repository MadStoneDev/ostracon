export const formatCount = (count: number): string => {
  if (count < 1000) {
    return count.toString();
  }

  if (count < 1000000) {
    const thousands = count / 1000;
    // Round to 1 decimal place
    const rounded = Math.round(thousands * 10) / 10;
    // If it's a whole number, don't show decimal
    return rounded % 1 === 0 ? `${Math.floor(rounded)}k` : `${rounded}k`;
  }

  const millions = count / 1000000;
  // Round to 1 decimal place
  const rounded = Math.round(millions * 10) / 10;
  // If it's a whole number, don't show decimal
  return rounded % 1 === 0 ? `${Math.floor(rounded)}M` : `${rounded}M`;
};
