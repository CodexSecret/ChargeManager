export const calculateTotalCost = (data, selectedCar, discount) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (isNaN(startDate) || isNaN(endDate) || startDate > endDate || !selectedCar) {
    return 0;
  }

  const pricePerDay = selectedCar.price;
  const extras = data.extraFeatures;

  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  let updatedTotalCost = days * pricePerDay;

  if (extras.includes('childBooster')) {
    updatedTotalCost += 30;
  }

  if (extras.includes('insurance')) {
    const insurancePerDay = 10;
    updatedTotalCost += days * insurancePerDay;
  }

  if (discount > 0) {
    updatedTotalCost *= (100 - discount) / 100; // Apply the coupon discount
  }

  return updatedTotalCost;
};