import numeral from 'numeral';

export const formatterStr = (value: number | undefined): string => {
	return numeral(value).format('0,0') !== '0' ? numeral(value).format('0,0') : '';
};

export const parseApiDate = (value?: Date | string | number): Date | null => {
	if (!value) return null;
	if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

	const normalized = typeof value === 'string' ? value.trim() : value;
	const numericValue = typeof normalized === 'string' && /^\d+$/.test(normalized) ? Number(normalized) : normalized;
	const milliseconds = typeof numericValue === 'number' && numericValue < 100_000_000_000 ? numericValue * 1000 : numericValue;
	const parsed = new Date(milliseconds);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatApiDate = (value?: Date | string | number): string => {
	const date = parseApiDate(value);
	return date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date unavailable';
};

export const getDateDuration = (start?: Date | string | number, end?: Date | string | number): string => {
	const startDate = parseApiDate(start);
	const endDate = parseApiDate(end);
	if (!startDate || !endDate) return 'Duration unavailable';
	const days = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000));
	return `${days} day${days === 1 ? '' : 's'}`;
};
