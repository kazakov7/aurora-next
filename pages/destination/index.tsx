import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import DestinationHero from '../../libs/components/destination/DestinationHero';
import DestinationFilter from '../../libs/components/destination/DestinationFilter';
import DestinationCard from '../../libs/components/destination/DestinationCard';
import { DestinationsInquiry } from '../../libs/types/destination/destination.input';
import { Destination } from '../../libs/types/destination/destination';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_DESTINATIONS } from '../../apollo/user/query';
import { LIKE_TARGET_DESTINATION } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useI18n } from '../../libs/i18n';
import LoadingSpinner from '../../libs/components/common/LoadingSpinner';

// Exact destinationCountry values: a continent is the list of its countries, never a word in the description
const continentCountryMap: Record<string, string[]> = {
	all: [],
	asia: ['Japan', 'South Korea', 'Indonesia', 'Malaysia', 'Singapore', 'Thailand', 'Vietnam', 'United Arab Emirates', 'China', 'India', 'Philippines'],
	europe: ['Switzerland', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Portugal', 'Czech Republic', 'United Kingdom', 'Turkey', 'Greece', 'Austria', 'Norway', 'Sweden'],
	africa: ['Morocco', 'Egypt', 'South Africa', 'Tanzania', 'Kenya', 'Nigeria'],
	'north-america': ['Canada', 'United States', 'Mexico'],
	'south-america': ['Peru', 'Brazil', 'Chile', 'Argentina', 'Colombia'],
	oceania: ['Australia', 'New Zealand', 'Fiji'],
};
const toCountryList = (continent: string): string[] | undefined =>
	continentCountryMap[continent]?.length ? continentCountryMap[continent] : undefined;

const defaultInput: DestinationsInquiry = {
	page: 1,
	limit: 15,
	sort: 'destinationViews',
	direction: Direction.DESC,
	search: {},
};

const DestinationList: NextPage = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [selectedContinent, setSelectedContinent] = useState<string>('all');
	const [selectedSort, setSelectedSort] = useState<string>('views');
	const [searchFilter, setSearchFilter] = useState<DestinationsInquiry>(defaultInput);
	const currentPage = searchFilter.page;

	const [destinations, setDestinations] = useState<Destination[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS: PURE GRAPHQL BACKEND DATA **/
	const [likeTargetDestination] = useMutation(LIKE_TARGET_DESTINATION);
	const { data, loading, refetch: refetchDestinations } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (data?.getDestinations) {
			setDestinations(data.getDestinations.list ?? []);
			setTotal(data.getDestinations.metaCounter?.[0]?.total ?? 0);
		}
	}, [data]);

	// Sync with router query: the continent and the header search are separate filters and work together
	useEffect(() => {
		if (!router.isReady) return;
		const continent = typeof router.query.continent === 'string' ? router.query.continent : 'all';
		const text = typeof router.query.search === 'string' ? router.query.search : undefined;
		setSelectedContinent(continent);
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, destinationCountryList: toCountryList(continent), text },
		}));
	}, [router.isReady, router.query.continent, router.query.search]);

	/** HANDLERS: REAKTIV FILTRLASH & SARALASH (NO APPLY BUTTON) **/
	const handleSelectContinent = async (continent: string) => {
		setSelectedContinent(continent);
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: { ...prev.search, destinationCountryList: toCountryList(continent) },
		}));

		// The header search stays in the URL next to the continent
		const { search } = router.query;
		await router.push(
			{
				pathname: '/destination',
				query: { ...(typeof search === 'string' && { search }), ...(continent !== 'all' && { continent }) },
			},
			undefined,
			{ shallow: true, scroll: false },
		);
	};

	const handleSelectSort = (sortVal: string) => {
		setSelectedSort(sortVal);

		let sortField = 'destinationViews';
		switch (sortVal) {
			case 'likes':
				sortField = 'destinationLikes';
				break;
			case 'rating':
				sortField = 'destinationRating';
				break;
			case 'newest':
				sortField = 'createdAt';
				break;
			case 'views':
			default:
				sortField = 'destinationViews';
				break;
		}

		const updated: DestinationsInquiry = {
			...searchFilter,
			page: 1,
			sort: sortField,
			direction: Direction.DESC,
		};

		setSearchFilter(updated);
	};

	const handlePaginationChange = (page: number) => {
		const updated: DestinationsInquiry = {
			...searchFilter,
			page,
		};
		setSearchFilter(updated);
		window.scrollTo({ top: 380, behavior: 'smooth' });
	};

	const likeDestinationHandler = async (e: React.MouseEvent, destinationId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
			await likeTargetDestination({
				variables: { destinationId },
			});
			await refetchDestinations({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likeDestinationHandler:', err.message);
			sweetMixinErrorAlert(tError(err));
		}
	};

	const limit = searchFilter.limit || 15;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
	const endItem = Math.min(currentPage * limit, total);

	return (
		<div className="destination-page-wrapper">
			<Head>
				<title>{t('destinations.list.metaTitle')}</title>
				<meta
					name="title"
					content={t('destinations.list.metaName')}
				/>
			</Head>

			{/* 1. Hero Section */}
			<DestinationHero />

			{/* 2. Main 1300px Content Container */}
			<div className="destination-main-container">
				{/* Filter & Sort Bar */}
				<DestinationFilter
					selectedContinent={selectedContinent}
					onSelectContinent={handleSelectContinent}
					selectedSort={selectedSort}
					onSelectSort={handleSelectSort}
					totalCount={total}
				/>

				{/* 3. Destinations 5-Column Grid */}
				{loading && destinations.length === 0 ? (
					<div className="listing-loader-wrapper">
						<LoadingSpinner size="lg" label={t('destinations.list.loadingDestinations')} />
					</div>
				) : destinations.length === 0 ? (
					<div className="empty-destinations-state">
						<span className="material-symbols-outlined empty-icon">travel_explore</span>
						<h3 className="empty-title">{t('destinations.list.noDestinationsFound')}</h3>
						<p className="empty-desc">
							{t('destinations.list.emptyText')}
						</p>
					</div>
				) : (
					<div className="destinations-grid-layout" style={{ position: 'relative' }}>
						{loading && (
							<LoadingSpinner overlay size="md" label={t('destinations.list.loadingDestinations')} />
						)}
						{destinations.map((dest, idx) => (
							<DestinationCard
								key={dest._id || `destination-${idx}`}
								destination={dest}
								index={idx}
								onLike={likeDestinationHandler}
							/>
						))}
					</div>
				)}

				{/* 4. Pagination Section */}
				{total > 0 && (
					<section className="destinations-pagination-section">
						{totalPages > 1 && (
							<div className="pagination-controls-row">
								<button
									type="button"
									className="page-arrow-btn"
									disabled={currentPage <= 1}
									onClick={() => handlePaginationChange(currentPage - 1)}
									aria-label={t('common.previousPage')}
								>
									<span className="material-symbols-outlined">chevron_left</span>
								</button>

								{Array.from({ length: totalPages }).map((_, i) => {
									const p = i + 1;
									return (
										<button
											key={p}
											type="button"
											className={`page-number-btn ${currentPage === p ? 'active' : ''}`}
											onClick={() => handlePaginationChange(p)}
										>
											{p}
										</button>
									);
								})}

								<button
									type="button"
									className="page-arrow-btn"
									disabled={currentPage >= totalPages}
									onClick={() => handlePaginationChange(currentPage + 1)}
									aria-label={t('common.nextPage')}
								>
									<span className="material-symbols-outlined">chevron_right</span>
								</button>
							</div>
						)}

						<p className="pagination-tally-text">
							{t('destinations.list.showingRange', { startItem, endItem, total })}
						</p>
					</section>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(DestinationList);
