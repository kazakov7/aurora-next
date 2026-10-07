import numeral from 'numeral';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') !== '0' ? numeral(value).format('0,0') : '';
};
