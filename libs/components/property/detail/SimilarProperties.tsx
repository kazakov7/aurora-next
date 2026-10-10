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
import { useI18n } from '../../../i18n';
import { RevealOnScroll } from '../../motion/RevealOnScroll';
import { StaggerContainer } from '../../motion/StaggerContainer';
import { StaggerItem } from '../../motion/StaggerItem';
import { HoverLift } from '../../motion/HoverLift';

interface SimilarPropertiesProps {
	currentPropertyId: string;
	city?: string;
}

const SimilarProperties = ({ currentPropertyId, city }: SimilarPropertiesProps) => {
	const { t, tEnum, tError } = useI18n();
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
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		try {
			await likeTargetProperty({ variables: { propertyId: propId } });
			await refetch();
		} catch (err: any) {
			await sweetErrorAlert(tError(err, 'common.errorOccurred'));
		}
	};

	if (!loading && similarList.length === 0) return null;

	return (
		<section className="similar-properties-section">
			<RevealOnScroll distance={16}>
				<div className="section-header-row">
					<div>
						<h2 className="section-heading">{t('hotels.similar.similarHotels')}</h2>
						<p className="section-subtext">{city ? t('hotels.similar.moreStaysIn', { city }) : t('hotels.similar.moreAvailableStays')}</p>
					</div>
					<Link href="/property" className="view-all-link">
						<span>{t('hotels.similar.viewAllHotels')}</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>
			</RevealOnScroll>

			<StaggerContainer className="similar-grid-row">
				{similarList.map((item: Property) => {
					const cardImg = getImageUrl(item.propertyImages?.[0]);
					const isLiked = item.meLiked && item.meLiked[0]?.myFavorite;
					const rating = typeof item.propertyRating === 'number' ? item.propertyRating.toFixed(2) : '—';

					return (
						<StaggerItem key={item._id} style={{ height: '100%' }}>
							<HoverLift y={-4} scale={1.01} style={{ height: '100%' }}>
								<article
									className="similar-card"
									onClick={() => router.push(`/property/detail?id=${item._id}`)}
									style={{ height: '100%' }}
								>
									<div className="card-image-box">
										{cardImg ? <img src={cardImg} alt={item.propertyName} className="card-img" /> : <div className="card-image-empty">{t('common.noImageAvailable')}</div>}
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
												{t('hotels.similar.guestsBedrooms', { maxGuests: item.maxGuests, bedrooms: item.bedrooms })}
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
										<p className="card-type">{tEnum('propertyType', item.propertyType)}</p>

										<div className="card-bottom-price">
											<span className="price-tag">
												${item.pricePerNight?.toLocaleString('en-US')}
											</span>
											<span className="night-tag">{t('common.perNight')}</span>
										</div>
									</div>
								</article>
							</HoverLift>
						</StaggerItem>
					);
				})}
			</StaggerContainer>
		</section>
	);
};

export default SimilarProperties;
