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
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { useI18n } from '../../libs/i18n';
import MobileFilterPanel from '../../libs/components/common/MobileFilterPanel';

const defaultInput: ToursInquiry = {
	page: 1,
	limit: 6,
	sort: 'tourViews',
	direction: Direction.DESC,
	search: {},
};

const TourList: NextPage = ({ initialInput = defaultInput }: any) => {
	const { t, tError } = useI18n();
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
	const [selectedSort, setSelectedSort] = useState<string>('RECOMMENDED');

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
					if (parsed.direction === Direction.ASC) setSelectedSort('PRICE_ASC');
					else setSelectedSort('PRICE_DESC');
				} else if (parsed.sort === 'tourStartDate') {
					setSelectedSort('DEPARTURE_ASC');
				} else if (parsed.sort === 'tourLikes') {
					setSelectedSort('POPULAR');
				} else if (parsed.sort === 'tourRating') {
					setSelectedSort('RATING_DESC');
				} else if (parsed.sort === 'createdAt') {
					setSelectedSort('NEWEST');
				} else {
					setSelectedSort('RECOMMENDED');
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
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
			await likeTargetTour({
				variables: { tourId },
			});
			await refetchTours({ input: searchFilter });
		} catch (err: any) {
			console.log('ERROR, likeTourHandler:', err.message);
			sweetMixinErrorAlert(tError(err));
		}
	};

	const sortChangeHandler = async (e: React.ChangeEvent<HTMLSelectElement>) => {
		const val = e.target.value;
		setSelectedSort(val);

		let sortField = 'tourViews';
		let sortDirection = Direction.DESC;

		switch (val) {
			case 'PRICE_ASC':
				sortField = 'tourPrice';
				sortDirection = Direction.ASC;
				break;
			case 'PRICE_DESC':
				sortField = 'tourPrice';
				sortDirection = Direction.DESC;
				break;
			case 'DEPARTURE_ASC':
				sortField = 'tourStartDate';
				sortDirection = Direction.ASC;
				break;
			case 'POPULAR':
				sortField = 'tourLikes';
				sortDirection = Direction.DESC;
				break;
			case 'RATING_DESC':
				sortField = 'tourRating';
				sortDirection = Direction.DESC;
				break;
			case 'NEWEST':
				sortField = 'createdAt';
				sortDirection = Direction.DESC;
				break;
			case 'RECOMMENDED':
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
				<title>{t('tours.list.metaTitle')}</title>
				<meta name="title" content={t('tours.list.metaName')} />
			</Head>

			{/* Hero Section */}
			<TourHero />

			{/* Main Content Layout */}
			<div className="tour-main-container">
				<div className="tour-layout-flex">
					{/* Left Sidebar Filter */}
					<MobileFilterPanel title={t('tours.filter.filters')}>
						<TourFilter
							searchFilter={searchFilter}
							setSearchFilter={setSearchFilter}
							initialInput={initialInput}
						/>
					</MobileFilterPanel>

					{/* Right Column Listing */}
					<main className="tour-listing-main">
						{/* Listing Header Bar */}
						<div className="listing-header-box">
							<div className="header-top-row">
								<div className="heading-with-counter">
									<h2 className="listing-heading">{t('tours.list.exploreTours')}</h2>
									<span className="journeys-badge">{t('tours.list.journeysAvailable', { total })}</span>
								</div>

								{/* Sort Dropdown */}
								<div className="sort-group">
									<span className="sort-title">{t('tours.list.sortBy')}</span>
									<div className="sort-dropdown-box">
										<select
											value={selectedSort}
											onChange={sortChangeHandler}
											className="sort-dropdown"
										>
											<option value="RECOMMENDED">{t('tours.list.recommended')}</option>
											<option value="PRICE_ASC">{t('tours.list.priceLowToHigh')}</option>
											<option value="PRICE_DESC">{t('tours.list.priceHighToLow')}</option>
											<option value="DEPARTURE_ASC">{t('tours.list.departureDate')}</option>
											<option value="POPULAR">{t('tours.list.mostPopular')}</option>
											<option value="RATING_DESC">{t('common.topRated')}</option>
											<option value="NEWEST">{t('common.newest')}</option>
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
								<h3>{t('tours.list.noJourneysFound')}</h3>
								<p>{t('tours.list.adjustFilters')}</p>
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
											getItemAriaLabel={(type, page, selected) =>
												type === 'page'
													? t(selected ? 'common.pagination.currentPage' : 'common.pagination.goToPage', { page })
													: t(`common.pagination.${type}`)
											}
										/>
									</Stack>
								)}

								{tours.length !== 0 && (
									<Stack className="total-result" sx={{ mt: 2 }}>
										<Typography variant="body2" color="text.secondary">
											{t('tours.list.totalAvailable', { count: total })}
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
