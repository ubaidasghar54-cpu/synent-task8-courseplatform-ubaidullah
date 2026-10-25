// Formats price into PKR / configured currency (e.g. Rs 4,999)
export const formatPrice = (amount) => {
  const numericAmount = Number(amount) || 0;
  const currency = import.meta.env.VITE_CURRENCY || 'PKR';

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericAmount);
};

export default formatPrice;
