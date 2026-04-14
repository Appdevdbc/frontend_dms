/**
 * Composable for generating distinct chart colors.
 * Usage: const { getColors, chartHeight } = useChartColors();
 */
const PALETTE = [
  '#1976D2', '#43A047', '#FB8C00', '#E53935', '#8E24AA',
  '#00ACC1', '#6D4C41', '#D81B60', '#FFB300', '#546E7A',
  '#7CB342', '#5C6BC0', '#F4511E', '#00897B', '#C0CA33',
  '#3949AB', '#039BE5', '#EF6C00', '#AD1457', '#4E342E',
  '#1565C0', '#2E7D32', '#EF5350', '#AB47BC', '#26A69A',
  '#FF7043', '#78909C', '#9CCC65', '#42A5F5', '#EC407A',
];

/**
 * Returns an array of N distinct colors, cycling through the palette.
 * @param {number} count
 * @returns {string[]}
 */
export const getColors = (count) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(PALETTE[i % PALETTE.length]);
  }
  return colors;
};

/**
 * Calculates dynamic chart height based on number of items.
 * @param {number} count - number of data items
 * @param {number} perItem - pixels per item (default 40)
 * @param {number} base - base padding (default 100)
 * @returns {number}
 */
export const chartHeight = (count, perItem = 40, base = 100) => {
  return Math.max(300, count * perItem + base);
};

export const useChartColors = () => ({ getColors, chartHeight });

