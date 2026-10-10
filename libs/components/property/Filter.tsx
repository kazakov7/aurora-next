import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@apollo/client';
import { GET_PROPERTY_CITIES } from '../../../apollo/user/query';
import { PRICE_FILTER_MAX, PRICE_FILTER_MIN, PRICE_FILTER_STEP, PROPERTY_AMENITY_OPTIONS } from '../../config';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { PropertyType } from '../../enums/property.enum';

interface FilterProps {
	searchFilter: PropertiesInquiry;
	setSearchFilter: React.Dispatch<React.SetStateAction<PropertiesInquiry>>;
	initialInput: PropertiesInquiry;
}

const propertyTypes = [
	{ label: 'Hotel', value: PropertyType.HOTEL },
	{ label: 'Resort', value: PropertyType.RESORT },
	{ label: 'Villa', value: PropertyType.VILLA },
	{ label: 'Apartment', value: PropertyType.APARTMENT },
	{ label: 'Guesthouse', value: PropertyType.GUESTHOUSE },
	{ label: 'Motel', value: PropertyType.MOTEL },
	{ label: 'Hostel', value: PropertyType.HOSTEL },
	{ label: 'Other', value: PropertyType.OTHER },
];

const guestOptions = [
	{ label: '1+ Guests', value: 1 },
	{ label: '2+ Guests', value: 2 },
	{ label: '4+ Guests', value: 4 },
	{ label: '5+ Guests', value: 5 },
];

const amenitiesList = PROPERTY_AMENITY_OPTIONS.map((value) => ({ label: value, value }));

const Filter = ({ searchFilter, setSearchFilter, initialInput }: FilterProps) => {
	const router = useRouter();
	const [searchText, setSearchText] = useState(searchFilter?.search?.text || '');
	const [selectedCity, setSelectedCity] = useState<string>(
		searchFilter?.search?.propertyCityList?.[0] || '',
	);
	const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
		searchFilter?.search?.propertyTypeList || [],
	);
	const [selectedGuests, setSelectedGuests] = useState<number | null>(
		searchFilter?.search?.minGuests ?? null,
	);
	const [maxPrice, setMaxPrice] = useState<number>(
		searchFilter?.search?.pricePerNightRange?.end || PRICE_FILTER_MAX,
	);
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
		searchFilter?.search?.amenities || [],
	);

	/** APOLLO REQUESTS **/
	const { data: cityData } = useQuery(GET_PROPERTY_CITIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: { page: 1, limit: 100, search: {} } },
	});
	const cityList = useMemo(() => {
		const cities = new Set<string>();
		(cityData?.getProperties?.list ?? []).forEach((item: Property) => {
			if (item.propertyCity) cities.add(item.propertyCity);
		});
		if (selectedCity) cities.add(selectedCity);
		return Array.from(cities).sort((a, b) => a.localeCompare(b));
	}, [cityData, selectedCity]);

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter?.search?.text || '');
		setSelectedCity(searchFilter?.search?.propertyCityList?.[0] || '');
		setSelectedTypes(searchFilter?.search?.propertyTypeList || []);
		setSelectedGuests(searchFilter?.search?.minGuests ?? null);
		setSelectedAmenities(searchFilter?.search?.amenities || []);
		setMaxPrice(searchFilter?.search?.pricePerNightRange?.end || PRICE_FILTER_MAX);
	}, [searchFilter]);

	/** ROUTER UPDATE HELPER **/
	const applyFilterImmediately = async (newFilter: PropertiesInquiry) => {
		setSearchFilter(newFilter);
		await router.push(
			{
				pathname: '/property',
				query: { input: JSON.stringify(newFilter) },
			},
			undefined,
			{ scroll: false },
		);
	};

	/** HANDLERS **/
	const searchInputChangeHandler = (val: string) => {
		setSearchText(val);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				text: val.trim() ? val.trim() : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const citySelectHandler = (city: string) => {
		const newCity = selectedCity === city ? '' : city;
		setSelectedCity(newCity);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				propertyCityList: newCity ? [newCity] : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const priceRangeChangeHandler = (price: number) => {
		setMaxPrice(price);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				pricePerNightRange: price < PRICE_FILTER_MAX ? { start: 0, end: price } : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const typeToggleHandler = (type: PropertyType) => {
		let updated: PropertyType[];
		if (selectedTypes.includes(type)) {
			updated = selectedTypes.filter((t) => t !== type);
		} else {
			updated = [...selectedTypes, type];
		}
		setSelectedTypes(updated);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				propertyTypeList: updated.length > 0 ? updated : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const guestsSelectHandler = (val: number) => {
		const isDeselect = selectedGuests === val;
		setSelectedGuests(isDeselect ? null : val);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				minGuests: isDeselect ? undefined : val,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const amenityToggleHandler = (amenity: string) => {
		let updated: string[];
		if (selectedAmenities.includes(amenity)) {
			updated = selectedAmenities.filter((a) => a !== amenity);
		} else {
			updated = [...selectedAmenities, amenity];
		}
		setSelectedAmenities(updated);
		const newFilter: PropertiesInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				amenities: updated.length > 0 ? updated : undefined,
			},
		};
		applyFilterImmediately(newFilter);
	};

	const clearAllHandler = () => {
		setSearchText('');
		setSelectedCity('');
		setSelectedTypes([]);
		setSelectedGuests(null);
		setMaxPrice(PRICE_FILTER_MAX);
		setSelectedAmenities([]);
		applyFilterImmediately(initialInput);
	};

	return (
		<aside className="filter-sidebar">
			{/* Sidebar Header */}
			<div className="filter-header">
				<div className="filter-title-box">
					<span className="material-symbols-outlined filter-icon">tune</span>
					<span className="filter-title">Filters</span>
				</div>
				<button className="clear-all-btn" type="button" onClick={clearAllHandler}>
					Clear All
				</button>
			</div>

			{/* Destination Filter */}
			<div className="filter-section">
				<label className="section-label">Destination</label>
				<div className="destination-search-box">
					<span className="material-symbols-outlined search-icon">search</span>
					<input
						type="text"
						value={searchText}
						placeholder="Search country or city..."
						className="search-input"
						onChange={(e) => searchInputChangeHandler(e.target.value)}
					/>
				</div>
				<div className="destination-chips">
					{cityList.map((city) => (
						<button
							key={city}
							type="button"
							className={`dest-chip ${selectedCity === city ? 'active' : ''}`}
							onClick={() => citySelectHandler(city)}
						>
							{city}
						</button>
					))}
				</div>
			</div>

			{/* Price Range */}
			<div className="filter-section">
				<div className="price-label-row">
					<label className="section-label">Price per night</label>
					<span className="currency-label">USD ($)</span>
				</div>
				<div className="price-slider-box">
					<input
						type="range"
						min={PRICE_FILTER_MIN}
						max={PRICE_FILTER_MAX}
						step={PRICE_FILTER_STEP}
						value={maxPrice}
						className="price-slider"
						onChange={(e) => priceRangeChangeHandler(Number(e.target.value))}
					/>
				</div>
				<div className="price-display-row">
					<div className="price-box-col">
						<span className="box-tag">Min</span>
						<span className="box-val">${PRICE_FILTER_MIN.toLocaleString()}</span>
					</div>
					<span className="price-dash">—</span>
					<div className="price-box-col">
						<span className="box-tag">Max</span>
						<span className="box-val">
							{maxPrice >= PRICE_FILTER_MAX
								? `$${PRICE_FILTER_MAX.toLocaleString()}+`
								: `$${maxPrice.toLocaleString()}`}
						</span>
					</div>
				</div>
			</div>

			{/* Property Type */}
			<div className="filter-section">
				<label className="section-label">Property Type</label>
				<div className="checkbox-list">
					{propertyTypes.map((item) => (
						<label key={item.value} className="checkbox-item">
							<div className="checkbox-left">
								<input
									type="checkbox"
									checked={selectedTypes.includes(item.value)}
									onChange={() => typeToggleHandler(item.value)}
									className="checkbox-input"
								/>
								<span className="checkbox-text">{item.label}</span>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Amenities */}
			<div className="filter-section">
				<label className="section-label">Amenities</label>
				<div className="checkbox-list">
					{amenitiesList.map((item) => (
						<label key={item.value} className="checkbox-item">
							<div className="checkbox-left">
								<input
									type="checkbox"
									checked={selectedAmenities.includes(item.value)}
									onChange={() => amenityToggleHandler(item.value)}
									className="checkbox-input"
								/>
								<span className="checkbox-text">{item.label}</span>
							</div>
						</label>
					))}
				</div>
			</div>

			{/* Guest Capacity */}
			<div className="filter-section">
				<label className="section-label">Guest Capacity</label>
				<div className="guest-grid">
					{guestOptions.map((opt) => (
						<button
							key={opt.label}
							type="button"
							className={`guest-btn ${selectedGuests === opt.value ? 'active' : ''}`}
							onClick={() => guestsSelectHandler(opt.value)}
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>
		</aside>
	);
};

export default Filter;
