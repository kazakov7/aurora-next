import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_FAVORITES, GET_FAVORITE_TOURS } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY, LIKE_TARGET_TOUR } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { getImageUrl } from '../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

const MyProfileWishlist: React.FC = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [activeTab, setActiveTab] = useState<'ALL' | 'HOTELS' | 'TOURS'>('ALL');

	/** APOLLO REQUESTS **/
	const [likePropertyMutation] = useMutation(LIKE_TARGET_PROPERTY);
	const [likeTourMutation] = useMutation(LIKE_TARGET_TOUR);

	const { data: propData, refetch: refetchProps } = useQuery(GET_FAVORITES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 20,
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const { data: tourData, refetch: refetchTours } = useQuery(GET_FAVORITE_TOURS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 20,
			},
		},
		skip: !user?._id,
		notifyOnNetworkStatusChange: true,
	});

	const favoriteProperties = propData?.getFavorites?.list || [];
	const favoriteTours = tourData?.getFavoriteTours?.list || [];

	const combinedList = [
		...favoriteProperties.map((p: any) => ({ ...p, isTour: false })),
		...favoriteTours.map((t: any) => ({ ...t, isTour: true })),
	];

	const displayList = combinedList.filter((item) => {
		if (activeTab === 'HOTELS') return !item.isTour;
		if (activeTab === 'TOURS') return item.isTour;
		return true;
	});

	const total = displayList.length;

	/** HANDLERS **/
	const handleRemoveFavorite = async (e: React.MouseEvent, item: any) => {
		e.stopPropagation();
		try {
			if (item.isTour) {
				await likeTourMutation({ variables: { input: item._id } });
				await refetchTours();
			} else {
				await likePropertyMutation({ variables: { input: item._id } });
				await refetchProps();
			}
			sweetTopSmallSuccessAlert('Removed from Wishlist.', 800);
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Action failed.');
		}
	};

	return (
		<div>
			{/* Top Control Bar */}
			<div className="section-top-bar">
				<div className="title-group">
					<h2>My Wishlist</h2>
					<span className="counter-pill">{total} saved places</span>
				</div>
				<div className="bar-actions">
					<div className="category-pills" style={{ display: 'flex', gap: '8px' }}>
						<button
							type="button"
							className={`cat-pill-btn ${activeTab === 'ALL' ? 'active' : ''}`}
							onClick={() => setActiveTab('ALL')}
						>
							All ({combinedList.length})
						</button>
						<button
							type="button"
							className={`cat-pill-btn ${activeTab === 'HOTELS' ? 'active' : ''}`}
							onClick={() => setActiveTab('HOTELS')}
						>
							Hotels ({favoriteProperties.length})
						</button>
						<button
							type="button"
							className={`cat-pill-btn ${activeTab === 'TOURS' ? 'active' : ''}`}
							onClick={() => setActiveTab('TOURS')}
						>
							Tours ({favoriteTours.length})
						</button>
					</div>
				</div>
			</div>

			{/* Wishlist Cards Grid */}
			{displayList.length > 0 ? (
				<div className="wishlist-cards-grid">
					{displayList.map((item: any) => {
						const isTour = item.isTour;
						const title = isTour ? item.tourTitle || item.tourName : item.propertyTitle || item.propertyName;
						const location = isTour ? item.tourLocation || 'Expedition' : item.propertyAddress || item.propertyLocation;
						const price = isTour ? item.tourPrice : item.propertyPrice;
						const img = getImageUrl(
							isTour ? item.tourImages?.[0] : item.propertyImages?.[0],
							'https://lh3.googleusercontent.com/aida-public/AB6AXuD8_BY-EVXIV7xo-yc9MYTb9NSoxhEi7EEv_XTCME9ZgfFw4tHp3r2MxvwZtjXUEnDFhGmRxFL45eq5LW-kSq3pfgKWZailt6pMXNLA7AILQwc6ni5OJlwUQwfaSoibHu1ciegz2OHO18tz_NErv3xXG3t7qtchAETDE-3q0qOCuiNxi1N43cAY-jINAZZJvIGhJEGSvz8a4onhCI47CfTAEJatfn0hxZHImOuDPkE7YYbavINRkHb6',
						);

						return (
							<div
								key={item._id}
								className="wishlist-card-item"
								style={{ cursor: 'pointer' }}
								onClick={() =>
									router.push(isTour ? `/tour/detail?id=${item._id}` : `/property/detail?id=${item._id}`)
								}
							>
								<div className="card-thumb-box">
									<img src={img} alt={title} />
									<span className="type-badge">{isTour ? 'TOUR' : 'HOTEL'}</span>
									<button
										type="button"
										className="remove-fav-btn"
										aria-label="Remove from Wishlist"
										onClick={(e) => handleRemoveFavorite(e, item)}
									>
										<span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
											favorite
										</span>
									</button>
								</div>

								<div className="card-content-box">
									<h3 className="fav-title">{title}</h3>
									<div className="fav-loc">
										<span className="material-symbols-outlined">location_on</span>
										<span>{location}</span>
									</div>
									<div className="fav-bottom-price">
										<span className="price-val">₩{(price || 750000).toLocaleString()}</span>
										<span className="rating-val">
											<span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#f59e0b', fontVariationSettings: "'FILL' 1" }}>
												star
											</span>
											4.9
										</span>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="profile-empty-state">
					<div className="empty-icon">
						<span className="material-symbols-outlined">bookmark_border</span>
					</div>
					<h3>Your wishlist is empty</h3>
					<p>Explore sanctuaries, architectural hotels, and private tours across the world to save them here.</p>
				</div>
			)}
		</div>
	);
};

export default MyProfileWishlist;
