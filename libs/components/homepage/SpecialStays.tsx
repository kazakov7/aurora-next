import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { Message } from '../../enums/common.enum';
import { getImageUrl } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import LikeButton from '../common/LikeButton';

interface SpecialStaysProps {
	properties: Property[];
	loading?: boolean;
	error?: Error;
}

const formatUsd = (price?: number) => (typeof price === 'number' ? `$${price.toLocaleString()}` : 'Price on request');

const SpecialStays = ({ properties, loading, error }: SpecialStaysProps) => {
	const user = useReactiveVar(userVar);
	const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
	const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState<Record<string, boolean>>({});
	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	/** HANDLERS **/
	const likePropertyHandler = async (event: React.MouseEvent, propertyId: string, wasLiked: boolean) => {
		// The card is a Link, so the anchor navigation must be cancelled as well
		event.preventDefault();
		event.stopPropagation();
		if (updatingFavoriteIds[propertyId]) return;
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: !wasLiked }));
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: true }));
			await likeTargetProperty({ variables: { propertyId } });
		} catch (err: unknown) {
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: wasLiked }));
			const errorMessage = err instanceof Error ? err.message : 'Unable to update favorite status.';
			console.log('ERROR, likePropertyHandler:', errorMessage);
			sweetMixinErrorAlert(errorMessage);
		} finally {
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: false }));
		}
	};

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
					{loading && !properties.length ? <p className="stays-empty-state">Loading top stays…</p> : null}
					{!loading && error ? <p className="stays-empty-state">Top stays are unavailable right now.</p> : null}
					{properties.map((stay) => {
						const isLiked = favoriteOverrides[stay._id] ?? Boolean(stay.meLiked?.[0]?.myFavorite);
						const imageUrl = getImageUrl(stay.propertyImages?.[0]);

						return (
							<Link key={stay._id} href={{ pathname: '/property/detail', query: { id: stay._id } }} className="stay-card">
								<div className="card-image-box">
									{imageUrl ? <img src={imageUrl} alt={stay.propertyName} className="stay-img" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : null}
									<span className="location-badge">{stay.propertyCity || stay.propertyAddress || 'Location unavailable'}</span>
									<span className="like-btn-wrapper">
										<LikeButton
											isLiked={isLiked}
											onClick={(event) => likePropertyHandler(event, stay._id, isLiked)}
											className="stay-like-btn"
										/>
									</span>
								</div>
								<div className="card-body">
									<div className="card-top-row">
										<h3 className="stay-title">{stay.propertyName}</h3>
										<div className="rating-box"><span className="material-symbols-outlined star-icon filled">star</span><span className="rating-num">{typeof stay.propertyRating === 'number' ? stay.propertyRating.toFixed(2) : '—'}</span></div>
									</div>
									{stay.propertyDesc ? <p className="stay-desc">{stay.propertyDesc}</p> : null}
									<div className="card-bottom-row">
										<div className="price-box"><span className="price-val">{formatUsd(stay.pricePerNight)}</span><span className="price-unit"> / night</span></div>
										<button className="reserve-btn" type="button" onClick={(event) => { event.stopPropagation(); }}>Reserve</button>
									</div>
								</div>
							</Link>
						);
					})}
					{!loading && !error && properties.length === 0 ? <p className="stays-empty-state">No ranked stays available yet.</p> : null}
				</div>
			</div>
		</section>
	);
};

export default SpecialStays;
