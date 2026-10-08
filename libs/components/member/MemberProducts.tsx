import React, { useState } from 'react';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { GET_PROPERTIES, GET_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY, LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { Member } from '../../types/member/member';
import { userVar } from '../../../apollo/store';
import PropertyCard from '../property/PropertyCard';
import TourCard from '../tour/TourCard';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { Message } from '../../enums/common.enum';

interface MemberProductsProps {
	member: Member;
}

const MemberProducts: React.FC<MemberProductsProps> = ({ member }) => {
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
			sweetMixinErrorAlert('Please log in first');
			router.push('/account/login');
			return;
		}
		try {
			await likeTargetProperty({ variables: { input: id } });
			sweetTopSmallSuccessAlert('Success!', 700);
			refetchProps();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Action failed');
		}
	};

	const likeTourHandler = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (!user?._id) {
			sweetMixinErrorAlert('Please log in first');
			router.push('/account/login');
			return;
		}
		try {
			await likeTargetTour({ variables: { input: id } });
			sweetTopSmallSuccessAlert('Success!', 700);
			refetchTours();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Action failed');
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

	const memberName = member?.memberFullName || member?.memberNick || 'Member';
	const title = isHotel ? 'Hotel' : isTour ? 'Tour' : 'Products';
	const gridClass = isHotel ? 'hotels-grid' : 'tours-grid';

	return (
		<div className="member-content-area">
			{/* Content Header */}
			<div className="content-header-row">
				<div className="header-title-box">
					<div className="title-badge-wrap">
						<h2>{title}</h2>
						<span className="count-pill">{total} available</span>
					</div>
					<p className="header-subtitle">Explore offerings from {memberName}.</p>
				</div>
			</div>

			{loading && list.length === 0 ? (
				<p className="member-profile-state">Loading {title.toLowerCase()}...</p>
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
					<h3>No {title.toLowerCase()} yet</h3>
					<p>{memberName} has not published any {title.toLowerCase()} yet.</p>
				</div>
			)}

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="pagination-wrapper">
					<span className="pagination-info">
						Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total}
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
