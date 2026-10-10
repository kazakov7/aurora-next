import React, { useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_PROPERTIES, GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY, LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { Member } from '../../types/member/member';
import { userVar } from '../../../apollo/store';
import PropertyCard from '../property/PropertyCard';
import TourCard from '../tour/TourCard';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';
import { useI18n } from '../../i18n';

interface MemberProductsProps {
	member: Member;
}

/** Dictionary keys per product kind, so no sentence is assembled from an English noun **/
const PRODUCT_KEYS = {
	hotel: {
		title: 'member.products.title.hotel',
		loading: 'member.products.loading.hotel',
		empty: 'member.products.empty.hotel',
		emptyText: 'member.products.emptyText.hotel',
	},
	tour: {
		title: 'member.products.title.tour',
		loading: 'member.products.loading.tour',
		empty: 'member.products.empty.tour',
		emptyText: 'member.products.emptyText.tour',
	},
	products: {
		title: 'member.products.title.products',
		loading: 'member.products.loading.products',
		empty: 'member.products.empty.products',
		emptyText: 'member.products.emptyText.products',
	},
};

const MemberProducts: React.FC<MemberProductsProps> = ({ member }) => {
	const { t, tError } = useI18n();
	const [page, setPage] = useState<number>(1);
	const user = useReactiveVar(userVar);
	const router = useRouter();
	
	const hasProperties = (member?.memberProperties || 0) > 0;
	const hasTours = (member?.memberTours || 0) > 0;
	
	const isHotel = hasProperties;
	const isTour = !hasProperties && hasTours;

	const { data: propData, loading: propLoading, refetch: refetchProps } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: page,
				limit: 12,
				search: {
					memberId: member._id,
				},
			},
		},
		skip: !isHotel,
	});

	const { data: tourData, loading: tourLoading, refetch: refetchTours } = useQuery(GET_TOURS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: page,
				limit: 12,
				search: {
					memberId: member._id,
				},
			},
		},
		skip: !isTour,
	});

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const likePropertyHandler = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (!user?._id) {
			sweetMixinErrorAlert(t('common.pleaseLogInFirst'));
			router.push('/account/login');
			return;
		}
		try {
			await likeTargetProperty({ variables: { propertyId: id } });
			refetchProps();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'common.actionFailed'));
		}
	};

	const likeTourHandler = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (!user?._id) {
			sweetMixinErrorAlert(t('common.pleaseLogInFirst'));
			router.push('/account/login');
			return;
		}
		try {
			await likeTargetTour({ variables: { tourId: id } });
			refetchTours();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, 'common.actionFailed'));
		}
	};

	const loading = isHotel ? propLoading : tourLoading;
	const propertiesList = propData?.getProperties?.list || [];
	const propTotal = propData?.getProperties?.metaCounter?.[0]?.total || 0;
	
	const toursList = tourData?.getTours?.list || [];
	const tourTotal = tourData?.getTours?.metaCounter?.[0]?.total || 0;
	
	const total = isHotel ? propTotal : tourTotal;
	const totalPages = Math.ceil(total / 12) || 1;
	const list = isHotel ? propertiesList : toursList;

	const memberName = member?.memberFullName || member?.memberNick || t('common.member');
	const productKeys = PRODUCT_KEYS[isHotel ? 'hotel' : isTour ? 'tour' : 'products'];
	const title = t(productKeys.title);
	const gridClass = isHotel ? 'hotels-grid' : 'tours-grid';

	return (
		<div className="member-content-area">
			{/* Content Header */}
			<div className="content-header-row">
				<div className="header-title-box">
					<div className="title-badge-wrap">
						<h2>{title}</h2>
						<span className="count-pill">{t('member.products.available', { total })}</span>
					</div>
					<p className="header-subtitle">{t('member.products.exploreOfferingsFrom', { memberName })}</p>
				</div>
			</div>

			{loading && list.length === 0 ? (
				<p className="member-profile-state">{t(productKeys.loading)}</p>
			) : list.length > 0 ? (
				<div className={isHotel ? "property-page-wrapper" : "tour-page-wrapper"} style={{ background: 'transparent' }}>
					<div className={isHotel ? "property-listing-main" : "tour-listing-main"}>
						<div className={gridClass}>
							{isHotel
								? propertiesList.map((prop: any) => (
										<PropertyCard
											key={prop._id}
											property={prop}
											likePropertyHandler={likePropertyHandler}
										/>
								  ))
								: toursList.map((tour: any) => (
										<TourCard
											key={tour._id}
											tour={tour}
											likeTourHandler={likeTourHandler}
										/>
								  ))}
						</div>
					</div>
				</div>
			) : (
				<div className="articles-empty-card">
					<div className="empty-icon-box">
						<span className="material-symbols-outlined">inventory_2</span>
					</div>
					<h3>{t(productKeys.empty)}</h3>
					<p>{t(productKeys.emptyText, { memberName })}</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination-wrapper">
					<span className="pagination-info">
						{t('member.products.showingRange', { page: (page - 1) * 12 + 1, math: Math.min(page * 12, total), total })}
					</span>
					<div className="pagination-pills">
						<button
							type="button"
							className="nav-arrow-btn"
							disabled={page === 1}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							<span className="material-symbols-outlined">chevron_left</span>
						</button>

						{Array.from({ length: totalPages }).map((_, i) => {
							const p = i + 1;
							return (
								<button
									key={p}
									type="button"
									className={`page-num-btn ${page === p ? 'active' : ''}`}
									onClick={() => setPage(p)}
								>
									{p}
								</button>
							);
						})}

						<button
							type="button"
							className="nav-arrow-btn"
							disabled={page === totalPages}
							onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
						>
							<span className="material-symbols-outlined">chevron_right</span>
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default MemberProducts;
