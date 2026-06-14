export const formatCurrency = (amount, currencyCode = 'IDR') => {
  const value = Number(amount) || 0
  const formatter = new Intl.NumberFormat(
    currencyCode === 'IDR' ? 'id-ID' : 'en-US',
    {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }
  )
  const formatted = formatter.format(Math.abs(value))
  return value < 0 ? `-${formatted}` : formatted
}

export const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}


export const formatAbbreviated = (value) => {
  if (!value || parseFloat(value) === 0) return '-';
  const num = Math.abs(parseFloat(value));

  let val = 0;
  let unit = "";

  if (num >= 1e9) {
    val = num / 1e9;
    unit = " B";
  } else if (num >= 1e6) {
    val = num / 1e6;
    unit = " M";
  } else {
    val = num;
  }

  const rounded = Math.round(val);

  return `${rounded.toLocaleString('en-US')}${unit}`;
};