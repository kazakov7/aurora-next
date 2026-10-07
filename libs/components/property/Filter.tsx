import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PropertiesInquiry } from '../../types/property/property.input';
import { PropertyType } from '../../enums/property.enum';

interface FilterProps {
	searchFilter: PropertiesInquiry;
	setSearchFilter: React.Dispatch<React.SetStateAction<PropertiesInquiry>>;
	initialInput: PropertiesInquiry;
}

const destinationsList = ['Busan', 'Seoul', 'Jeju', 'Japan', 'Greece', 'Switzerland', 'Italy'];

const propertyTypes = [
	{ label: 'Luxury Hotel', value: PropertyType.HOTEL, count: 4 },
	{ label: 'Resort', value: PropertyType.RESORT, count: 1 },
	{ label: 'Private Villa', value: PropertyType.VILLA, count: 1 },
	{ label: 'Design Apartment', value: PropertyType.APARTMENT, count: 3 },
	{ label: 'Guesthouse Lodge', value: PropertyType.GUESTHOUSE, count: 2 },
];

const guestOptions = [
	{ label: '1+ Guests', value: 1 },
	{ label: '2+ Guests', value: 2 },
	{ label: '4+ Guests', value: 4 },
	{ label: '5+ Guests', value: 5 },
];

const amenitiesList = [
	{ label: 'WiFi', value: 'WiFi' },
	{ label: 'Breakfast', value: 'Breakfast' },
	{ label: 'Ocean View', value: 'Ocean View' },
	{ label: 'Parking', value: 'Parking' },
	{ label: 'Gym', value: 'Gym' },
];

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
		searchFilter?.search?.pricePerNightRange?.end || 500000,
	);
	const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
		searchFilter?.search?.amenities || [],
	);

	/** LIFECYCLES **/
	useEffect(() => {
		setSearchText(searchFilter?.search?.text || '');
		setSelectedCity(searchFilter?.search?.propertyCityList?.[0] || '');
		setSelectedTypes(searchFilter?.search?.propertyTypeList || []);
		setSelectedGuests(searchFilter?.search?.minGuests ?? null);
		setSelectedAmenities(searchFilter?.search?.amenities || []);
		if (searchFilter?.search?.pricePerNightRange?.end) {
			setMaxPrice(searchFilter.search.pricePerNightRange.end);
		}
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
				pricePerNightRange: price < 500000 ? { start: 0, end: price } : undefined,
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
		setMaxPrice(500000);
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
					{destinationsList.map((city) => (
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
					<span className="currency-label">USD / KRW</span>
				</div>
				<div className="price-slider-box">
					<input
						type="range"
						min="50000"
						max="500000"
						step="10000"
						value={maxPrice}
						className="price-slider"
						onChange={(e) => priceRangeChangeHandler(Number(e.target.value))}
					/>
				</div>
				<div className="price-display-row">
					<div className="price-box-col">
						<span className="box-tag">Min</span>
						<span className="box-val">₩50,000</span>
					</div>
					<span className="price-dash">—</span>
					<div className="price-box-col">
						<span className="box-tag">Max</span>
						<span className="box-val">
							{maxPrice >= 500000
								? 'Max (All)'
								: `₩${maxPrice.toLocaleString()}`}
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
							<span className="item-count">{item.count}</span>
						</label>
					))}
				</div>
			</div>

			{/* Star Rating */}
			<div className="filter-section">
				<label className="section-label">Star Rating</label>
				<div className="checkbox-list">
					<label className="checkbox-item">
						<div className="checkbox-left">
							<input
								type="checkbox"
								defaultChecked
								className="checkbox-input"
								onChange={(e) => {
									if (e.target.checked) {
										applyFilterImmediately({
											...searchFilter,
											page: 1,
											sort: 'propertyRating',
										});
									}
								}}
							/>
							<span className="checkbox-text">
								5 Stars <span className="star-gold">★★★★★</span>
							</span>
						</div>
						<span className="item-count">98</span>
					</label>
					<label className="checkbox-item">
						<div className="checkbox-left">
							<input type="checkbox" className="checkbox-input" />
							<span className="checkbox-text">
								4 Stars <span className="star-gold">★★★★</span>
							</span>
						</div>
						<span className="item-count">26</span>
					</label>
					<label className="checkbox-item">
						<div className="checkbox-left">
							<input type="checkbox" className="checkbox-input" />
							<span className="checkbox-text">Boutique / Other</span>
						</div>
						<span className="item-count">12</span>
					</label>
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
