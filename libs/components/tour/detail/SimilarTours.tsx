import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_TOURS } from '../../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';
import { Message } from '../../../enums/common.enum';
import { sweetErrorAlert } from '../../../sweetAlert';
import { getDurationDays } from '../../../utils';
import { useI18n } from '../../../i18n';
import { RevealOnScroll } from '../../motion/RevealOnScroll';
import { StaggerContainer } from '../../motion/StaggerContainer';
import { StaggerItem } from '../../motion/StaggerItem';
import { HoverLift } from '../../motion/HoverLift';

interface SimilarToursProps {
	currentTourId: string;
	destinationCity?: string;
}

const SimilarTours = ({ currentTourId, destinationCity }: SimilarToursProps) => {
	const { t, tEnum, tError } = useI18n();
	const getDuration = (tour: Tour): string => {
		const days = getDurationDays(tour.tourStartDate, tour.tourEndDate);
		return days ? t('common.days', { count: days }) : t('common.durationUnavailable');
	};
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);
	const { data, loading, refetch } = useQuery(GET_TOURS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				search: destinationCity ? { tourDestinationCity: destinationCity } : {},
			},
		},
	});
	const tours: Tour[] = data?.getTours?.list || [];
	const similarTours = tours.filter((tour) => tour._id !== currentTourId).slice(0, 4);

	/** HANDLERS **/
	const handleLike = async (event: React.MouseEvent, tourId: string) => {
		event.stopPropagation();
		if (!user?._id) {
			await sweetErrorAlert(t(Message.NOT_AUTHENTICATED));
			return;
		}
		try {
			await likeTargetTour({ variables: { tourId } });
			await refetch();
		} catch (error: unknown) {
			await sweetErrorAlert(tError(error, 'tours.similar.favoriteUpdateFailed'));
		}
	};

	if (!loading && similarTours.length === 0) return null;

	return (
		<section className="similar-tours-section">
			<RevealOnScroll distance={16}>
				<div className="section-header-row">
					<div>
						<h2 className="section-heading">{t('tours.similar.similarTours')}</h2>
						<p className="section-subtext">{t('tours.similar.subtitle')}</p>
					</div>
					<Link href="/tour" className="view-all-link">
						<span>{t('tours.similar.viewAllTours')}</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>
			</RevealOnScroll>

			<StaggerContainer className="similar-tours-grid">
				{similarTours.map((tour) => {
					const image = getImageUrl(tour.tourImages?.[0]);
					const isLiked = Boolean(tour.meLiked?.[0]?.myFavorite);
					const rating = typeof tour.tourRating === "number" ? tour.tourRating.toFixed(2) : "—";

					return (
						<StaggerItem key={tour._id} style={{ height: "100%" }}>
							<HoverLift y={-4} scale={1.01} style={{ height: "100%" }}>
								<article
									className="similar-tour-card"
									onClick={() => router.push(`/tour/detail?id=${tour._id}`)}
									style={{ height: "100%" }}
								>
									<div className="card-image-box">
										{image ? (
											<img src={image} alt={tour.tourName} className="card-img" />
										) : (
											<div className="card-image-empty">{t('common.noImageAvailable')}</div>
										)}
										{tour.tourDestinationCity ? (
											<span className="card-dest-pill">{tour.tourDestinationCity}</span>
										) : null}
										<button
											className={`card-heart-btn ${isLiked ? 'liked' : ''}`}
											type="button"
											aria-label={t('tours.similar.saveTour')}
											onClick={(event) => handleLike(event, tour._id)}
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
											<span className="duration-capacity">
												{getDuration(tour)} · {tour.tourCapacity} {t('tours.similar.seats')}
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
										<h3 className="card-title">{tour.tourName}</h3>
										<p className="card-subtitle">{tEnum('tourStatus', tour.tourStatus)}</p>
										<div className="card-bottom-line">
											<div className="price-group">
												<span className="price-tag">${tour.tourPrice.toLocaleString('en-US')}</span>
												<span className="traveler-tag">{t('tours.similar.perTraveler')}</span>
											</div>
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

export default SimilarTours;
