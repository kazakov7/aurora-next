import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import TourHero from '../../libs/components/tour/TourHero';
import TourCard from '../../libs/components/tour/TourCard';
import TourFilter from '../../libs/components/tour/TourFilter';
import { ToursInquiry } from '../../libs/types/tour/tour.input';
import { Tour } from '../../libs/types/tour/tour';
import { Direction, Message } from '../../libs/enums/common.enum';
import { GET_TOURS } from '../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../libs/sweetAlert';

const defaultInput: ToursInquiry = {
	page: 1,
	limit: 12,
	sort: 'tourViews',
	direction: Direction.DESC,
	search: {},
};

const quickCategories = [
	{ label: 'All Tours', value: 'ALL' },
	{ label: 'Adventure', value: 'Adventure' },
	{ label: 'Jeju', value: 'Jeju' },
	{ label: 'Expeditions', value: 'Expeditions' },
	{ label: 'Cultural', value: 'Cultural' },
];

const TourList: NextPage = ({ initialInput = defaultInput }: any) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [searchFilter, setSearchFilter] = useState<ToursInquiry>(() => {
		if (typeof window !== 'undefined' && router.query.input) {
			try {
				return JSON.parse(router.query.input as string);
			} catch (e) {
				return initialInput;
			}
		}
		return initialInput;
	});

	const [tours, setTours] = useState<Tour[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [selectedSort, setSelectedSort] = useState<string>('Recommended');
	const [activeCategory, setActiveCategory] = useState<string>('ALL');

	/** APOLLO REQUESTS **/
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const { data, loading, refetch: refetchTours } = useQuery(GET_TOURS, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES: PURE BACKEND GRAPHQL DATA **/
	useEffect(() => {
		const list: Tour[] = data?.getTours?.list;
		const meta = data?.getTours?.metaCounter?.[0]?.total;

		if (list) {
			setTours(list);
		}
		if (meta !== undefined) {
			setTotal(meta);
		}
	}, [data]);

	useEffect(() => {
		if (router.query.input) {
			try {
				const parsed = JSON.parse(router.query.input as string);
				setSearchFilter(parsed);
				setCurrentPage(parsed.page || 1);

				// Sync sort dropdown state
				if (parsed.sort === 'tourPrice') {
					if (parsed.direction === Direction.ASC) setSelectedSort('Price: Low to High');
					else setSelectedSort('Price: High to Low');
				} else if (parsed.sort === 'tourStartDate') {
					setSelectedSort('Departure Date');
				} else if (parsed.sort === 'tourLikes') {
					setSelectedSort('Most Popular');
				} else if (parsed.sort === 'tourRating') {
					setSelectedSort('Top Rated');
				} else if (parsed.sort === 'createdAt') {
					setSelectedSort('Newest');
				} else {
					setSelectedSort('Recommended');
				}

				// Sync active category pill
				if (parsed.search?.text) {
					setActiveCategory(parsed.search.text);
				} else {
					setActiveCategory('ALL');
				}

				refetchTours({ input: parsed });
			} catch (e) {
				// ignore parse error
			}
		}
	}, [router.query.input]);

	/** HANDLERS **/
	const handlePaginationChange = async (newPage: number) => {
		const updated = { ...searchFilter, page: newPage };
		setSearchFilter(updated);
		setCurrentPage(newPage);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};

	const likeTourHandler = async (e: React.MouseEvent, tourId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetTour({
				variables: { tourId },
			});
			await refetchTours({ input: searchFilter });
			await sweetTopSmallSuccessAlert('Saved to wishlist!', 800);
		} catch (err: any) {
			console.log('ERROR, likeTourHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const sortChangeHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value;
		setSelectedSort(val);

		let sortField = 'tourViews';
		let sortDirection = Direction.DESC;

		switch (val) {
			case 'Price: Low to High':
				sortField = 'tourPrice';
				sortDirection = Direction.ASC;
				break;
			case 'Price: High to Low':
				sortField = 'tourPrice';
				sortDirection = Direction.DESC;
				break;
			case 'Departure Date':
				sortField = 'tourStartDate';
				sortDirection = Direction.ASC;
				break;
			case 'Most Popular':
				sortField = 'tourLikes';
				sortDirection = Direction.DESC;
				break;
			case 'Top Rated':
				sortField = 'tourRating';
				sortDirection = Direction.DESC;
				break;
			case 'Newest':
				sortField = 'createdAt';
				sortDirection = Direction.DESC;
				break;
			case 'Recommended':
			default:
				sortField = 'tourViews';
				sortDirection = Direction.DESC;
				break;
		}

		const updated: ToursInquiry = {
			...searchFilter,
			page: 1,
			sort: sortField,
			direction: sortDirection,
		};

		setSearchFilter(updated);
		setCurrentPage(1);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};

	const categoryClickHandler = async (cat: string) => {
		setActiveCategory(cat);
		const updated: ToursInquiry = {
			...searchFilter,
			page: 1,
			search: {
				...searchFilter.search,
				text: cat === 'ALL' ? undefined : cat,
			},
		};

		setSearchFilter(updated);
		setCurrentPage(1);
		await router.push(
			{
				pathname: '/tour',
				query: { input: JSON.stringify(updated) },
			},
			undefined,
			{ scroll: false },
		);
	};

	const totalPages = Math.max(1, Math.ceil(total / (searchFilter.limit || 12)));

	return (
		<div className="tour-page-wrapper">
			<Head>
				<title>AURA | Curated Tours &amp; Expeditions</title>
				<meta name="title" content="AURA Tours & Expeditions" />
			</Head>

			{/* Hero Section */}
			<TourHero />

			{/* Main Content Layout */}
			<div className="tour-main-container">
				<div className="tour-layout-flex">
					{/* Left Sidebar Filter */}
					<TourFilter
						searchFilter={searchFilter}
						setSearchFilter={setSearchFilter}
						initialInput={initialInput}
					/>

					{/* Right Column Listing */}
					<main className="tour-listing-main">
						{/* Listing Header Bar */}
						<div className="listing-header-box">
							<div className="header-top-row">
								<div className="heading-with-counter">
									<h2 className="listing-heading">Explore Tours</h2>
									<span className="journeys-badge">{total} journeys available</span>
								</div>

								{/* Sort Dropdown */}
								<div className="sort-group">
									<span className="sort-title">Sort by</span>
									<div className="sort-dropdown-box">
										<select
											value={selectedSort}
											onChange={sortChangeHandler}
											className="sort-dropdown"
										>
											<option value="Recommended">Recommended</option>
											<option value="Price: Low to High">Price: Low to High</option>
											<option value="Price: High to Low">Price: High to Low</option>
											<option value="Departure Date">Departure Date</option>
											<option value="Most Popular">Most Popular</option>
											<option value="Top Rated">Top Rated</option>
											<option value="Newest">Newest</option>
										</select>
										<span className="material-symbols-outlined dropdown-icon">expand_more</span>
									</div>
								</div>
							</div>

							{/* Quick Category Filters */}
							<div className="quick-category-row">
								{quickCategories.map((cat) => (
									<button
										key={cat.value}
										type="button"
										className={`category-pill ${activeCategory === cat.value ? 'active' : ''}`}
										onClick={() => categoryClickHandler(cat.value)}
									>
										{cat.label}
									</button>
								))}
							</div>
						</div>

						{/* Tours Grid */}
						{tours.length === 0 && !loading ? (
							<div className="no-data-box">
								<span className="material-symbols-outlined no-data-icon">travel_explore</span>
								<h3>No Journeys Found</h3>
								<p>Try adjusting your search filters or destination criteria.</p>
							</div>
						) : (
							<div className="tours-grid">
								{tours.map((tour, idx) => (
									<TourCard
										key={tour._id || `tour-${idx}`}
										tour={tour}
										index={idx}
										likeTourHandler={likeTourHandler}
									/>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="pagination-wrapper">
								<div className="pagination-buttons">
									<button
										aria-label="Previous page"
										className="page-nav-btn"
										type="button"
										disabled={currentPage <= 1}
										onClick={() => handlePaginationChange(currentPage - 1)}
									>
										<span className="material-symbols-outlined">chevron_left</span>
									</button>

									{Array.from({ length: totalPages }).map((_, i) => {
										const p = i + 1;
										return (
											<button
												key={p}
												type="button"
												className={`page-num-btn ${currentPage === p ? 'active' : ''}`}
												onClick={() => handlePaginationChange(p)}
											>
												{p}
											</button>
										);
									})}

									<button
										aria-label="Next page"
										className="page-nav-btn"
										type="button"
										disabled={currentPage >= totalPages}
										onClick={() => handlePaginationChange(currentPage + 1)}
									>
										<span className="material-symbols-outlined">chevron_right</span>
									</button>
								</div>

								<p className="pagination-summary">
									Showing <span className="highlight-text">{tours.length}</span> of{' '}
									<span className="highlight-text">{total}</span> journeys available worldwide
								</p>
							</div>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(TourList);
