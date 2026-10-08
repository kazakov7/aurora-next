import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { Direction, Message } from '../../enums/common.enum';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';
import LikeButton from '../common/LikeButton';

interface SpecialStaysProps {
	initialInput?: PropertiesInquiry;
}

const formatKrw = (price?: number) => (typeof price === 'number' ? `₩${price.toLocaleString()}` : 'Price on request');

const SpecialStays = ({ initialInput }: SpecialStaysProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
	const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState<Record<string, boolean>>({});
	const queryInput: PropertiesInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'propertyViews',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const { data, loading, refetch } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
		ssr: false,
	});
	const properties: Property[] = data?.getProperties?.list ?? [];

	/** HANDLERS **/
	const likePropertyHandler = async (event: React.MouseEvent, propertyId: string, wasLiked: boolean) => {
		event.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: !wasLiked }));
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: true }));
			await likeTargetProperty({ variables: { propertyId } });
			await refetch({ input: queryInput });
			await sweetTopSmallSuccessAlert(wasLiked ? 'Removed from favorites' : 'Saved to favorites!', 800);
		} catch (err: any) {
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: wasLiked }));
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		} finally {
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: false }));
		}
	};

	const pushDetailHandler = (propertyId: string) => router.push({ pathname: '/property/detail', query: { id: propertyId } });

	return (
		<section className="special-stays-section">
			<div className="section-container">
				<div className="section-header">
					<div>
						<span className="section-tag">Sanctuaries &amp; Retreats</span>
						<h2 className="section-title">Stay Somewhere Special</h2>
						<p className="section-subtitle">Architectural marvels and tranquil sanctuaries curated for silence and form.</p>
					</div>
					<Link href="/property" className="section-link"><span>Browse all stays</span><span className="material-symbols-outlined">arrow_forward</span></Link>
				</div>

				<div className="stays-grid">
					{properties.map((stay) => {
						const isLiked = favoriteOverrides[stay._id] ?? Boolean(stay.meLiked?.[0]?.myFavorite);
						const imageUrl = getImageUrl(stay.propertyImages?.[0]);

						return (
							<div key={stay._id} className="stay-card cursor-pointer" onClick={() => pushDetailHandler(stay._id)}>
								<div className="card-image-box">
									{imageUrl ? <img src={imageUrl} alt={stay.propertyName} className="stay-img" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
									<span className="location-badge">{stay.propertyCity || stay.propertyAddress || 'Location unavailable'}</span>
									<div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
										<LikeButton 
											isLiked={isLiked} 
											onClick={(event) => likePropertyHandler(event, stay._id, isLiked)} 
											style={{ backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
										/>
									</div>
								</div>
								<div className="card-body">
									<div className="card-top-row">
										<h3 className="stay-title">{stay.propertyName}</h3>
										<div className="rating-box"><span className="material-symbols-outlined star-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span><span className="rating-num">{typeof stay.propertyRating === 'number' ? stay.propertyRating.toFixed(2) : '—'}</span></div>
									</div>
									{stay.propertyDesc ? <p className="stay-desc">{stay.propertyDesc}</p> : null}
									<div className="card-bottom-row">
										<div className="price-box"><span className="price-val">{formatKrw(stay.pricePerNight)}</span><span className="price-unit"> / night</span></div>
										<button className="reserve-btn" type="button" onClick={(event) => { event.stopPropagation(); pushDetailHandler(stay._id); }}>Reserve</button>
									</div>
								</div>
							</div>
						);
					})}
					{!loading && properties.length === 0 ? <p className="stays-empty-state">No stays available yet.</p> : null}
				</div>
			</div>
		</section>
	);
};

export default SpecialStays;
