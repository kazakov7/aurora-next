import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROPERTIES } from '../../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';
import { sweetErrorAlert } from '../../../sweetAlert';
import { Message } from '../../../enums/common.enum';

interface SimilarPropertiesProps {
	currentPropertyId: string;
	city?: string;
}

const SimilarProperties = ({ currentPropertyId, city }: SimilarPropertiesProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const { data, loading, refetch } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				search: city ? { propertyCityList: [city] } : {},
			},
		},
	});

	const rawList: Property[] = data?.getProperties?.list || [];
	const similarList = rawList
		.filter((p: Property) => p._id !== currentPropertyId)
		.slice(0, 4);

	const handleLike = async (e: React.MouseEvent, propId: string) => {
		e.stopPropagation();
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		try {
			await likeTargetProperty({ variables: { propertyId: propId } });
			await refetch();
		} catch (err: any) {
			await sweetErrorAlert(err.message || 'Error occurred');
		}
	};

	return (
		<section className="similar-properties-section">
			<div className="section-header-row">
				<div>
					<h2 className="section-heading">Similar Hotels</h2>
					<p className="section-subtext">{city ? `More stays in ${city}` : 'More available stays'}</p>
				</div>
				<Link href="/property" className="view-all-link">
					<span>View All Hotels</span>
					<span className="material-symbols-outlined">arrow_forward</span>
				</Link>
			</div>

			<div className="similar-grid-row">
				{similarList.map((item: Property) => {
					const cardImg = getImageUrl(item.propertyImages?.[0]);
					const isLiked = item.meLiked && item.meLiked[0]?.myFavorite;
					const rating = typeof item.propertyRating === 'number' ? item.propertyRating.toFixed(2) : '—';

					return (
						<article
							key={item._id}
							className="similar-card"
							onClick={() => router.push(`/property/detail?id=${item._id}`)}
						>
							<div className="card-image-box">
								{cardImg ? <img src={cardImg} alt={item.propertyName} className="card-img" /> : <div className="card-image-empty">No image available</div>}
								{item.propertyCity ? <span className="card-city-pill">{item.propertyCity}</span> : null}
								<button
									className={`card-heart-btn ${isLiked ? 'liked' : ''}`}
									type="button"
									onClick={(e) => handleLike(e, item._id)}
								>
									<span
										className="material-symbols-outlined"
										style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
									>
										favorite
									</span>
								</button>
							</div>

							<div className="card-info-box">
								<div className="card-meta-line">
									<span className="guests-beds">
										{item.maxGuests} Guests · {item.bedrooms} Bedrooms
									</span>
									<div className="rating-tag">
										<span
											className="material-symbols-outlined star-icon"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											star
										</span>
										<span>{rating}</span>
									</div>
								</div>

								<h3 className="card-title">{item.propertyName}</h3>
								<p className="card-type">{item.propertyType}</p>

								<div className="card-bottom-price">
									<span className="price-tag">
										${item.pricePerNight?.toLocaleString()}
									</span>
									<span className="night-tag">/ night</span>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default SimilarProperties;
