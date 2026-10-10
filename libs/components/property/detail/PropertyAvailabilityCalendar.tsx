import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_PROPERTY_AVAILABILITY } from '../../../../apollo/user/query';
import { useI18n } from '../../../i18n';

interface AvailabilityRange {
	checkIn: string;
	checkOut: string;
}

interface PropertyAvailabilityCalendarProps {
	propertyId: string;
	checkIn: string;
	checkOut: string;
	onChange: (checkIn: string, checkOut: string) => void;
}

const DAY_MS = 86_400_000;
const toKey = (date: Date): string => date.toISOString().slice(0, 10);
const fromKey = (value: string): Date => new Date(`${value}T00:00:00.000Z`);
const addDays = (value: string, days: number): string => toKey(new Date(fromKey(value).getTime() + days * DAY_MS));
const todayKey = (): string => toKey(new Date());
const monthStart = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const nextMonth = (date: Date, offset: number): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + offset, 1));
const getNights = (checkIn: string, checkOut: string): number => Math.max(0, Math.round((fromKey(checkOut).getTime() - fromKey(checkIn).getTime()) / DAY_MS));

const PropertyAvailabilityCalendar = ({ propertyId, checkIn, checkOut, onChange }: PropertyAvailabilityCalendarProps) => {
	const { locale, t } = useI18n();
	const [visibleMonth, setVisibleMonth] = useState(() => monthStart(fromKey(todayKey())));
	const rangeStart = toKey(visibleMonth);
	const rangeEnd = toKey(nextMonth(visibleMonth, 2));
	const { data, loading, error, refetch } = useQuery<{ getPropertyAvailability: AvailabilityRange[] }>(GET_PROPERTY_AVAILABILITY, {
		variables: { input: { propertyId, startDate: `${rangeStart}T00:00:00.000Z`, endDate: `${rangeEnd}T00:00:00.000Z` } },
		skip: !propertyId,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});

	useEffect(() => {
		const refresh = () => void refetch();
		window.addEventListener('focus', refresh);
		return () => window.removeEventListener('focus', refresh);
	}, [refetch]);

	const unavailableDates = useMemo(() => {
		const dates = new Set<string>();
		for (const range of data?.getPropertyAvailability ?? []) {
			for (let cursor = toKey(new Date(range.checkIn)); cursor < toKey(new Date(range.checkOut)); cursor = addDays(cursor, 1)) dates.add(cursor);
		}
		return dates;
	}, [data]);
	const minimumCheckIn = addDays(todayKey(), 1);
	const isBlocked = (date: string) => date < minimumCheckIn || unavailableDates.has(date);
	const canSelectRange = (start: string, end: string) => {
		for (let cursor = start; cursor < end; cursor = addDays(cursor, 1)) if (isBlocked(cursor)) return false;
		return true;
	};

	const selectDate = (date: string) => {
		if (isBlocked(date)) return;
		if (!checkIn || checkOut || date <= checkIn) {
			onChange(date, '');
			return;
		}
		if (!canSelectRange(checkIn, date)) {
			onChange(date, '');
			return;
		}
		onChange(checkIn, date);
	};

	const days = useMemo(() => {
		const first = monthStart(visibleMonth);
		const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
		return Array.from({ length: first.getUTCDay() + count }, (_, index) => index < first.getUTCDay() ? '' : toKey(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), index - first.getUTCDay() + 1))));
	}, [visibleMonth]);
	const selectedNights = checkIn && checkOut ? getNights(checkIn, checkOut) : 0;
	const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
	const weekdayFormatter = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
	const weekdays = Array.from({ length: 7 }, (_, index) => weekdayFormatter.format(new Date(Date.UTC(2023, 0, index + 1))));

	return (
		<section className="availability-calendar" aria-label={t('availability.calendarLabel')}>
			<div className="availability-heading"><h3>{t('availability.title')}</h3><button type="button" onClick={() => onChange('', '')}>{t('availability.clearDates')}</button></div>
			<div className="calendar-navigation"><button type="button" aria-label={t('availability.previousMonth')} onClick={() => setVisibleMonth((current) => nextMonth(current, -1))}>‹</button><strong>{formatter.format(visibleMonth)}</strong><button type="button" aria-label={t('availability.nextMonth')} onClick={() => setVisibleMonth((current) => nextMonth(current, 1))}>›</button></div>
			<div className="calendar-weekdays">{weekdays.map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
			<div className="calendar-days" aria-busy={loading}>
				{days.map((date, index) => {
					if (!date) return <span key={`blank-${index}`} />;
					const unavailable = unavailableDates.has(date);
					const disabled = isBlocked(date);
					const selected = date === checkIn || date === checkOut;
					const inRange = Boolean(checkIn && checkOut && date > checkIn && date < checkOut);
					const label = unavailable ? t('availability.dateUnavailable') : date < minimumCheckIn ? t('availability.pastDate') : date;
					return <button key={date} type="button" disabled={disabled} aria-label={`${date}: ${label}`} className={`${unavailable ? 'unavailable' : ''} ${selected ? 'selected' : ''} ${inRange ? 'in-range' : ''}`} onClick={() => selectDate(date)}>{fromKey(date).getUTCDate()}</button>;
				})}
			</div>
			{loading ? <p className="availability-state">{t('availability.loading')}</p> : null}
			{error ? <p className="availability-state error">{t('availability.error')}</p> : null}
			<div className="availability-legend"><span><i className="available" />{t('availability.available')}</span><span><i className="booked" />{t('availability.unavailable')}</span></div>
			<p className="availability-selection">{selectedNights ? t(selectedNights === 1 ? 'availability.selectedNights' : 'availability.selectedNightsPlural', { count: selectedNights }) : t('availability.selectDates')}</p>
		</section>
	);
};

export default PropertyAvailabilityCalendar;
