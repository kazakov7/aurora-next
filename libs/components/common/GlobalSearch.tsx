import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_DESTINATIONS, GET_PROPERTIES, GET_TOURS } from '../../../apollo/user/query';
import { Destination } from '../../types/destination/destination';
import { Property } from '../../types/property/property';
import { Tour } from '../../types/tour/tour';
import { useI18n } from '../../i18n';

type SearchResult = {
	id: string;
	group: 'Destinations' | 'Properties' | 'Tours';
	title: string;
	subtitle: string;
	pathname: string;
};

const SEARCH_LIMIT = 4;

const GlobalSearch = () => {
	const { t } = useI18n();
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);
	const [value, setValue] = useState('');
	const [searchText, setSearchText] = useState('');
	const [open, setOpen] = useState(false);
	const [activeIndex, setActiveIndex] = useState(-1);
	const canSearch = searchText.length >= 2;

	/** APOLLO REQUESTS **/
	const destinations = useQuery(GET_DESTINATIONS, {
		variables: { input: { page: 1, limit: SEARCH_LIMIT, search: { text: searchText } } },
		skip: !canSearch,
		fetchPolicy: 'network-only',
	});
	const properties = useQuery(GET_PROPERTIES, {
		variables: { input: { page: 1, limit: SEARCH_LIMIT, search: { text: searchText } } },
		skip: !canSearch,
		fetchPolicy: 'network-only',
	});
	const tours = useQuery(GET_TOURS, {
		variables: { input: { page: 1, limit: SEARCH_LIMIT, search: { text: searchText } } },
		skip: !canSearch,
		fetchPolicy: 'network-only',
	});

	const groupedResults = useMemo(() => {
		const destinationResults: SearchResult[] = (destinations.data?.getDestinations?.list ?? []).map((item: Destination) => ({
			id: item._id,
			group: t('navigation.destinations'),
			title: item.destinationName,
			subtitle: item.destinationCountry,
			pathname: '/destination/detail',
		}));
		const propertyResults: SearchResult[] = (properties.data?.getProperties?.list ?? []).map((item: Property) => ({
			id: item._id,
			group: t('common.properties'),
			title: item.propertyName,
			subtitle: [item.propertyCity, item.propertyAddress].filter(Boolean).join(', '),
			pathname: '/property/detail',
		}));
		const tourResults: SearchResult[] = (tours.data?.getTours?.list ?? []).map((item: Tour) => ({
			id: item._id,
			group: t('navigation.tours'),
			title: item.tourName,
			subtitle: [item.tourDestinationCity, item.tourDepartureCountry].filter(Boolean).join(', '),
			pathname: '/tour/detail',
		}));
		return [destinationResults, propertyResults, tourResults].filter((group) => group.length > 0);
	}, [destinations.data, properties.data, tours.data, t]);
	const flatResults = groupedResults.flat();
	const loading = destinations.loading || properties.loading || tours.loading;
	const error = destinations.error || properties.error || tours.error;

	/** LIFECYCLES **/
	useEffect(() => {
		const timer = window.setTimeout(() => setSearchText(value.trim()), 300);
		return () => window.clearTimeout(timer);
	}, [value]);

	useEffect(() => {
		const handleOutsideClick = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	useEffect(() => setActiveIndex(-1), [searchText]);

	/** HANDLERS **/
	const openResult = (result: SearchResult) => {
		setOpen(false);
		setValue('');
		void router.push({ pathname: result.pathname, query: { id: result.id } });
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Escape') {
			setOpen(false);
			return;
		}
		if (!flatResults.length) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			setOpen(true);
			setActiveIndex((current) => (current + 1) % flatResults.length);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			setOpen(true);
			setActiveIndex((current) => (current <= 0 ? flatResults.length - 1 : current - 1));
		} else if (event.key === 'Enter') {
			event.preventDefault();
			openResult(flatResults[activeIndex >= 0 ? activeIndex : 0]);
		}
	};

	let resultIndex = -1;
	return (
		<div className="nav-search" ref={rootRef}>
			<div className="search-input-wrapper">
				<span className="material-symbols-outlined search-icon">search</span>
				<input
					type="search"
					value={value}
					onChange={(event) => {
						setValue(event.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
					onKeyDown={handleKeyDown}
					placeholder={t('common.searchPlaceholder')}
					className="search-input"
					aria-label={t('common.searchAurora')}
					aria-expanded={open && canSearch}
					aria-controls="global-search-results"
					autoComplete="off"
				/>
			</div>
			{open && canSearch ? (
				<div id="global-search-results" className="global-search-results" role="listbox">
					{loading ? <p className="search-state">{t('common.searching')}</p> : null}
					{!loading && error ? <p className="search-state error">{t('common.searchUnavailable')}</p> : null}
					{!loading && !error && !flatResults.length ? <p className="search-state">{t('common.searchNoMatches')}</p> : null}
					{!loading && !error ? groupedResults.map((group) => (
						<section key={group[0].group} className="search-result-group" aria-label={group[0].group}>
							<h3>{group[0].group}</h3>
							{group.map((result) => {
								resultIndex += 1;
								const index = resultIndex;
								return (
									<button
										key={`${result.group}:${result.id}`}
										type="button"
										role="option"
										aria-selected={activeIndex === index}
										className={activeIndex === index ? 'active' : ''}
										onMouseEnter={() => setActiveIndex(index)}
										onClick={() => openResult(result)}
									>
										<span>{result.title}</span>
										{result.subtitle ? <small>{result.subtitle}</small> : null}
									</button>
								);
							})}
						</section>
					)) : null}
				</div>
			) : null}
		</div>
	);
};

export default GlobalSearch;
