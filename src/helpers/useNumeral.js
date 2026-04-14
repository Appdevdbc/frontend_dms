import numeral from 'numeral';

export const useNumeral = () => {
  const formatNumber = (value, format = '0,0') => {
    if (!value && value !== 0) return '';
    return numeral(value).format(format);
  };

  const unformatNumber = (value) => {
    if (!value) return null;
    return numeral(value).value();
  };

  const formatInteger = (value) => {
    return formatNumber(value, '0,0');
  };

  const formatDecimal = (value, decimals = 2) => {
    return formatNumber(value, `0,0.${'0'.repeat(decimals)}`);
  };

  const onlyNumber = (evt) => {
    const charCode = evt.which ? evt.which : evt.keyCode;
    if ((charCode > 31 && (charCode < 48 || charCode > 57)) || charCode === 45) {
      evt.preventDefault();
    }
  };

  return {
    formatNumber,
    unformatNumber,
    formatInteger,
    formatDecimal,
    onlyNumber
  };
};

