import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToursInquiry } from '../../types/tour/tour.input';
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, PRICE_FILTER_STEP } from '../../config';
import { useI18n } from '../../i18n';

interface TourFilterProps {
	searchFilter: ToursInquiry;
	setSearchFilter: React.Dispatch<React.SetStateAction<ToursInquiry>>;
	initialInput: ToursInquiry;
}

/** Options without a fixed label are rendered through common.travelerCount **/
const travelerOptions: { value: number; label?: string }[] = [
	{ value: 1 },
	{ value: 2 },
	{ label: '3–4', value: 3 },
	{ label: '5+', value: 5 },
];

const TourFilter = ({ searchFilter, setSearchFilter, initialInput }: TourFilterProps) => {
	const { t } = useI18n();
	const router = useRouter();
	const [searchText, setSearchText] = useState(searchFilter?.search?.text || '');
	const [selectedTravelers, setSelectedTravelers] = useState<number | null>(
		searchFilter?.search?.minAvailableSeats ?? null,
	);
	const [maxPrice, setMaxPrice] = useState<number>(
		searchFilter?.search?.tourPriceRange?.end || PRICE_FILTER_MAX,
	);
	const [departureDate, setDepartureDate] = useState<string>(
		searchFilter?.search?.tourStartDateRange?.start || '',
	);
	const [returnDate, setReturnDate] = useState<string>(
		searchFilter?.search?.tourStartDateRange?.end || '',
	);

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter?.search?.text || '');
		setSelectedTravelers(searchFilter?.search?.minAvailableSeats ?? null);
		if (searchFilter?.search?.tourPriceRange?.end) {
			setMaxPrice(searchFilter.search.tourPriceRange.end);
		} else {
			setMaxPrice(PRICE_FILTER_MAX);
		}
		if (searchFilter?.search?.tourStartDateRange?.start) {
			setDepartureDate(searchFilter.search.tourStartDateRange.start);
		}
		if (searchFilter?.search?.tourStartDateRange?.end) {
			setReturnDate(searchFilter.search.tourStartDateRange.end);
		}
	}, [searchFilter]);

	/** ROUTER UPDATE HELPER (INSTANT REACTIVE) **/
	const applyFilterImmediately = async (newFilter: ToursInquiry) => {
		setSearchFilter(newFilter);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(newFilter) },
			},
			undefined,
			{ scroll: false },
		);
	};

	/** HANDLERS **/
	const searchInputChangeHandler = (val: string) => {
		setSearchText(val);
		const newFilter: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				text: val.trim() ? val.trim() : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const priceChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = Number(e.target.value);
		setMaxPrice(val);
		const newFilter: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				tourPriceRange:
					val >= PRICE_FILTER_MAX
						? undefined
						: {
								start: 0,
								end: val,
						  },
			},
		};
		applyFilterImmediately(newFilter);
	};

	const departureDateHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const dateVal = e.target.value;
		setDepartureDate(dateVal);
		const newFilter: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
					tourStartDateRange: dateVal ? { start: dateVal, end: returnDate || dateVal } : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const returnDateHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		const dateVal = e.target.value;
		setReturnDate(dateVal);
		const newFilter: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
					tourStartDateRange: dateVal ? { start: departureDate || dateVal, end: dateVal } : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const travelersSelectHandler = (val: number) => {
		const newTravelers = selectedTravelers === val ? null : val;
		setSelectedTravelers(newTravelers);
		const newFilter: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				minAvailableSeats: newTravelers ?? undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const clearAllHandler = () => {
		setSearchText('');
		setSelectedTravelers(null);
		setMaxPrice(PRICE_FILTER_MAX);
		setDepartureDate('');
		setReturnDate('');
		applyFilterImmediately(initialInput);
	};

	return (
		<aside className="tour-filter-sidebar">
			<div className="filter-inner-card">
				{/* Header: Title & Clear All */}
				<div className="filter-header-row">
					<div className="filter-title-box">
						<span className="material-symbols-outlined">tune</span>
						<h2 className="filter-heading">{t('tours.filter.filters')}</h2>
					</div>
					<button className="clear-all-btn" type="button" onClick={clearAllHandler}>
						{t('tours.filter.clearAll')}
					</button>
				</div>

				{/* 1. Destination Search */}
				<div className="filter-section">
					<label className="filter-section-label">{t('common.destination')}</label>
					<div className="search-input-wrapper">
						<span className="material-symbols-outlined search-icon">search</span>
						<input
							type="text"
							className="search-input"
							placeholder={t('tours.filter.searchCountryOrCity')}
							value={searchText}
							onChange={(e) => searchInputChangeHandler(e.target.value)}
						/>
					</div>
				</div>

				{/* 2. Price Range Slider */}
				<div className="filter-section">
					<div className="price-header-row">
						<label className="filter-section-label">{t('tours.filter.priceRange')}</label>
						<span className="price-sub-label">{t('tours.filter.perPersonUsd')}</span>
					</div>
					<div className="slider-wrapper">
						<input
							type="range"
							min={PRICE_FILTER_MIN}
							max={PRICE_FILTER_MAX}
							step={PRICE_FILTER_STEP}
							value={maxPrice}
							onChange={priceChangeHandler}
							className="price-slider"
						/>
						<div className="slider-labels">
							<span>${PRICE_FILTER_MIN.toLocaleString('en-US')}</span>
							<span>${PRICE_FILTER_MAX.toLocaleString('en-US')}+</span>
						</div>
					</div>
					<div className="price-inputs-grid">
						<div className="price-box">
							<span className="box-label">{t('tours.filter.min')}</span>
							<span className="box-val">${PRICE_FILTER_MIN.toLocaleString('en-US')}</span>
						</div>
						<div className="price-box">
							<span className="box-label">{t('tours.filter.max')}</span>
							<span className="box-val">
								{maxPrice >= PRICE_FILTER_MAX ? t('tours.filter.maxAll') : `$${maxPrice.toLocaleString('en-US')}`}
							</span>
						</div>
					</div>
				</div>

				{/* 3. Departure & Return Dates */}
				<div className="filter-section">
					<div className="date-field-group">
						<label className="filter-section-label">{t('tours.filter.departureDate')}</label>
						<div className="date-picker-trigger">
							<input
								type="date"
								value={departureDate}
								onChange={departureDateHandler}
								className="native-date-input"
							/>
							<span className="material-symbols-outlined date-icon">calendar_today</span>
						</div>
					</div>
					<div className="date-field-group">
						<label className="filter-section-label">{t('tours.filter.returnDate')}</label>
						<div className="date-picker-trigger">
							<input
								type="date"
								value={returnDate}
								onChange={returnDateHandler}
								className="native-date-input"
							/>
							<span className="material-symbols-outlined date-icon">event</span>
						</div>
					</div>
				</div>

				{/* 4. Travelers */}
				<div className="filter-section">
					<label className="filter-section-label">{t('tours.filter.travelers')}</label>
					<div className="travelers-grid">
						{travelerOptions.map((opt) => (
							<button
								key={opt.value}
								type="button"
								className={`traveler-btn ${selectedTravelers === opt.value ? 'active' : ''}`}
								onClick={() => travelersSelectHandler(opt.value)}
							>
								{opt.label ?? t('common.travelerCount', { count: opt.value })}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Concierge Mini Promo Card */}
			<div className="concierge-promo-card">
				<div className="promo-header">
					<span className="material-symbols-outlined">support_agent</span>
					<span>{t('tours.filter.privateItineraries')}</span>
				</div>
				<p className="promo-desc">
					{t('tours.filter.bespokeText')}
				</p>
				<a href="#concierge" className="promo-link">
					<span>{t('tours.filter.inquireBespokeTour')}</span>
					<span className="material-symbols-outlined">chevron_right</span>
				</a>
			</div>
		</aside>
	);
};

export default TourFilter;
