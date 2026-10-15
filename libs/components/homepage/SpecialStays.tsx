import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation, useReactiveVar } from '@apollo/client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard, Swiper as SwiperInstance } from 'swiper';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { Message } from '../../enums/common.enum';
import { getImageUrl } from '../../config';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import LikeButton from '../common/LikeButton';
import { useI18n } from '../../i18n';
import { RevealOnScroll } from '../motion/RevealOnScroll';
import { HoverLift } from '../motion/HoverLift';
import LoadingSpinner from '../common/LoadingSpinner';

interface SpecialStaysProps {
	properties: Property[];
	loading?: boolean;
	error?: Error;
}

const formatUsd = (price: number | undefined, fallback: string) => (typeof price === 'number' ? `$${price.toLocaleString('en-US')}` : fallback);

const SpecialStays = ({ properties, loading, error }: SpecialStaysProps) => {
	const { t, tError } = useI18n();
	const user = useReactiveVar(userVar);
	const [favoriteOverrides, setFavoriteOverrides] = useState<Record<string, boolean>>({});
	const [updatingFavoriteIds, setUpdatingFavoriteIds] = useState<Record<string, boolean>>({});
	const swiperRef = useRef<SwiperInstance | null>(null);
	const [navigationState, setNavigationState] = useState({ isBeginning: true, isEnd: false });

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	/** HANDLERS **/
	const updateNavigationState = (swiper: SwiperInstance) => {
		setNavigationState({
			isBeginning: swiper.isBeginning,
			isEnd: swiper.isEnd,
		});
	};

	const previousSlideHandler = () => {
		swiperRef.current?.slidePrev();
	};

	const nextSlideHandler = () => {
		swiperRef.current?.slideNext();
	};

	const likePropertyHandler = async (event: React.MouseEvent, propertyId: string, wasLiked: boolean) => {
		event.preventDefault();
		event.stopPropagation();
		if (updatingFavoriteIds[propertyId]) return;
		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: !wasLiked }));
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: true }));
			await likeTargetProperty({ variables: { propertyId } });
		} catch (err: unknown) {
			setFavoriteOverrides((current) => ({ ...current, [propertyId]: wasLiked }));
			const errorMessage = tError(err, 'home.stays.favoriteUpdateFailed');
			console.log('ERROR, likePropertyHandler:', errorMessage);
			sweetMixinErrorAlert(errorMessage);
		} finally {
			setUpdatingFavoriteIds((current) => ({ ...current, [propertyId]: false }));
		}
	};

	return (
		<section className="special-stays-section">
			<div className="section-container">
				<RevealOnScroll distance={16}>
					<div className="section-header">
						<div>
							<span className="section-tag">{t('home.stays.eyebrow')}</span>
							<h2 className="section-title">{t('home.stays.title')}</h2>
							<p className="section-subtitle">{t('home.stays.description')}</p>
						</div>

						<div className="section-header-controls stays-carousel-controls">
							{properties.length > 2 ? (
								<>
									<button
										className="carousel-control-btn prev"
										type="button"
										onClick={previousSlideHandler}
										disabled={navigationState.isBeginning}
										aria-label={t('common.pagination.previous')}
										aria-controls="special-stays-carousel"
									>
										<span className="material-symbols-outlined">chevron_left</span>
									</button>
									<button
										className="carousel-control-btn next"
										type="button"
										onClick={nextSlideHandler}
										disabled={navigationState.isEnd}
										aria-label={t('common.pagination.next')}
										aria-controls="special-stays-carousel"
									>
										<span className="material-symbols-outlined">chevron_right</span>
									</button>
								</>
							) : null}
							<Link href="/property" className="section-link">
								<span>{t('home.stays.browse')}</span>
								<span className="material-symbols-outlined">arrow_forward</span>
							</Link>
						</div>
					</div>
				</RevealOnScroll>

				{loading && !properties.length ? <p className="stays-empty-state">{t('home.stays.loading')}</p> : null}
				{!loading && error ? <p className="stays-empty-state">{t('home.stays.unavailable')}</p> : null}

				{!loading && !error && properties.length === 0 ? (
					<p className="stays-empty-state">{t('home.stays.empty')}</p>
				) : null}

				{properties.length > 0 ? (
					<div id="special-stays-carousel" className="aurora-swiper-container">
						<Swiper
							modules={[A11y, Keyboard]}
							onSwiper={(swiper) => {
								swiperRef.current = swiper;
								updateNavigationState(swiper);
							}}
							onSlideChange={updateNavigationState}
							onResize={updateNavigationState}
							keyboard={{ enabled: true }}
							watchOverflow
							spaceBetween={12}
							slidesPerView="auto"
							slidesOffsetBefore={16}
							slidesOffsetAfter={16}
							breakpoints={{
								768: { slidesPerView: 2.5, spaceBetween: 20 },
								1024: { slidesPerView: 3, spaceBetween: 24 },
								1280: { slidesPerView: 4, spaceBetween: 24 },
							}}
						>
							{properties.map((stay) => {
								const isLiked = favoriteOverrides[stay._id] ?? Boolean(stay.meLiked?.[0]?.myFavorite);
								const imageUrl = getImageUrl(stay.propertyImages?.[0]);

								return (
									<SwiperSlide key={stay._id}>
										<HoverLift style={{ width: '100%', height: '100%' }}>
											<Link
												href={{ pathname: '/property/detail', query: { id: stay._id } }}
												className="stay-card"
												style={{ width: '100%', height: '100%' }}
											>
												<div className="card-image-box">
													{imageUrl ? (
														<img
															src={imageUrl}
															alt={stay.propertyName}
															className="stay-img"
															onError={(event) => {
																event.currentTarget.style.display = 'none';
															}}
														/>
													) : null}
													<span className="location-badge">
														{stay.propertyCity || stay.propertyAddress || t('home.stays.locationUnavailable')}
													</span>
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
														<div className="rating-box">
															<span className="material-symbols-outlined star-icon filled">star</span>
															<span className="rating-num">
																{typeof stay.propertyRating === 'number' ? stay.propertyRating.toFixed(2) : '—'}
															</span>
														</div>
													</div>
													{stay.propertyDesc ? <p className="stay-desc">{stay.propertyDesc}</p> : null}
													<div className="card-bottom-row">
														<div className="price-box">
															<span className="price-val">
																{formatUsd(stay.pricePerNight, t('home.stays.priceOnRequest'))}
															</span>
															<span className="price-unit"> {t('common.perNight')}</span>
														</div>
														<button
															className="reserve-btn"
															type="button"
															onClick={(event) => {
																event.stopPropagation();
															}}
														>
															{t('booking.reserve')}
														</button>
													</div>
												</div>
											</Link>
										</HoverLift>
									</SwiperSlide>
								);
							})}
						</Swiper>
					</div>
				) : loading ? (
					<div style={{ minHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
						<LoadingSpinner size="lg" label={t('common.loading')} />
					</div>
				) : null}
			</div>
		</section>
	);
};

export default SpecialStays;
