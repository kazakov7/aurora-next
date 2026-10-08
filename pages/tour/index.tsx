import { Pagination, Stack, Typography } from '@mui/material';
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
	limit: 6,
	sort: 'tourViews',
	direction: Direction.DESC,
	search: {},
};

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

				refetchTours({ input: parsed });
			} catch (e) {
				// ignore parse error
			}
		}
	}, [router.query.input]);

	/** HANDLERS **/
	const handlePaginationChange = async (event: React.ChangeEvent<unknown>, newPage: number) => {
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

	const totalPages = Math.max(1, Math.ceil(total / (searchFilter.limit || 6)));

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
								{tours.map((tour) => (
									<TourCard
										key={tour._id}
										tour={tour}
										likeTourHandler={likeTourHandler}
									/>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						{totalPages > 0 && (
							<Stack className="pagination-config" sx={{ mt: '50px', alignItems: 'center' }}>
								{tours.length !== 0 && (
									<Stack className="pagination-box">
										<Pagination
											page={currentPage}
											count={totalPages}
											onChange={handlePaginationChange}
											shape="circular"
											color="primary"
										/>
									</Stack>
								)}

								{tours.length !== 0 && (
									<Stack className="total-result" sx={{ mt: 2 }}>
										<Typography variant="body2" color="text.secondary">
											Total {total} journey{total > 1 ? 's' : ''} available
										</Typography>
									</Stack>
								)}
							</Stack>
						)}
					</main>
				</div>
			</div>
		</div>
	);
};

export default withLayoutBasic(TourList);
