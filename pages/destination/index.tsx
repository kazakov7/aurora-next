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
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

const continentCountryMap: Record<string, string> = {
	all: '',
	asia: 'Japan|South Korea',
	europe: 'Switzerland|Germany',
	africa: 'Africa|Morocco|Egypt|South Africa|Tanzania',
	'north-america': 'North America|Canada|United States|Mexico',
	'south-america': 'South America|Peru|Brazil|Chile|Argentina',
	oceania: 'Oceania|Australia|New Zealand',
};

const defaultInput: DestinationsInquiry = {
	page: 1,
	limit: 15,
	sort: 'destinationViews',
	direction: Direction.DESC,
	search: {},
};

const DestinationList: NextPage = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [selectedContinent, setSelectedContinent] = useState<string>('all');
	const [selectedSort, setSelectedSort] = useState<string>('views');
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [searchFilter, setSearchFilter] = useState<DestinationsInquiry>(defaultInput);

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
		const list: Destination[] = data?.getDestinations?.list;
		const meta = data?.getDestinations?.metaCounter?.[0]?.total;

		if (list) {
			setDestinations(list);
		}
		if (meta !== undefined) {
			setTotal(meta);
		}
	}, [data]);

	// Sync with router query if present on load or change
	useEffect(() => {
		if (router.query.continent && typeof router.query.continent === 'string') {
			const cont = router.query.continent;
			setSelectedContinent(cont);
			const textFilter = continentCountryMap[cont] || undefined;
			setSearchFilter((prev) => ({
				...prev,
				page: 1,
				search: {
					...prev.search,
					text: textFilter,
				},
			}));
		}
	}, [router.query.continent]);

	/** HANDLERS: REAKTIV FILTRLASH & SARALASH (NO APPLY BUTTON) **/
	const handleSelectContinent = async (continent: string) => {
		setSelectedContinent(continent);
		setCurrentPage(1);

		const textPattern = continentCountryMap[continent];
		const updated: DestinationsInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				text: textPattern || undefined,
			},
		};

		setSearchFilter(updated);

		await router.push(
			{
				pathname: '/destination',
				query: continent !== 'all' ? { continent } : {},
			},
			undefined,
			{ shallow: true, scroll: false },
		);
	};

	const handleSelectSort = (sortVal: string) => {
		setSelectedSort(sortVal);
		setCurrentPage(1);

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
		setCurrentPage(page);
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
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetDestination({
				variables: { destinationId },
			});
			await refetchDestinations({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Saved to wishlist!', 800);
		} catch (err: any) {
			console.log('ERROR, likeDestinationHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const limit = searchFilter.limit || 15;
	const totalPages = Math.max(1, Math.ceil(total / limit));
	const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
	const endItem = Math.min(currentPage * limit, total);

	return (
		<div className="destination-page-wrapper">
			<Head>
				<title>AURA | Explore the World - Curated Destinations</title>
				<meta
					name="title"
					content="Explore the World — Global Sanctuaries &amp; Territories | AURA Travel"
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
					<div className="destinations-grid-layout" style={{ opacity: 0.6 }}>
						<div className="empty-destinations-state" style={{ gridColumn: '1 / -1' }}>
							<span className="material-symbols-outlined empty-icon">sync</span>
							<h3 className="empty-title">Loading destinations...</h3>
						</div>
					</div>
				) : destinations.length === 0 ? (
					<div className="empty-destinations-state">
						<span className="material-symbols-outlined empty-icon">travel_explore</span>
						<h3 className="empty-title">No destinations found</h3>
						<p className="empty-desc">
							No curated sanctuaries or territories found in this selection yet.
						</p>
					</div>
				) : (
					<div className="destinations-grid-layout">
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
									aria-label="Previous page"
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
									aria-label="Next page"
								>
									<span className="material-symbols-outlined">chevron_right</span>
								</button>
							</div>
						)}

						<p className="pagination-tally-text">
							Showing {startItem}–{endItem} of {total} curated destinations worldwide
						</p>
					</section>
				)}
			</div>
		</div>
	);
};

export default withLayoutBasic(DestinationList);
