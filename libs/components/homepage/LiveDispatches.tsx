import React from 'react';
import { useRouter } from 'next/router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Keyboard } from 'swiper';
import { Destination } from '../../types/destination/destination';
import { getImageUrl } from '../../config';
import { ApolloError } from '@apollo/client';
import { useI18n } from '../../i18n';
import { RevealOnScroll } from '../motion/RevealOnScroll';
import { StaggerContainer } from '../motion/StaggerContainer';
import { StaggerItem } from '../motion/StaggerItem';
import { HoverLift } from '../motion/HoverLift';
import useDeviceDetect from '../../hooks/useDeviceDetect';

interface LiveDispatchesProps {
	destinations: Destination[];
	loading?: boolean;
	error?: ApolloError;
}

const destinationCardSizes = ['small', 'medium', 'featured', 'medium', 'small'];

const LiveDispatches = ({ destinations, loading, error }: LiveDispatchesProps) => {
	const router = useRouter();
	const { t, formatNumber } = useI18n();
	const device = useDeviceDetect();
	const isMobile = device === 'mobile';

	/** HANDLERS **/
	const navigateToDestination = (destinationId: string) => {
		router.push({
			pathname: '/destination/detail',
			query: { id: destinationId },
		});
	};

	const renderDispatchCard = (destination: Destination, index: number) => {
		const imageUrl = getImageUrl(destination.destinationImages?.[0]);
		const cardSize = destinationCardSizes[index] ?? 'small';

		return (
			<button
				type="button"
				className="traveler-destination-card"
				onClick={() => navigateToDestination(destination._id)}
			>
				{imageUrl ? <img src={imageUrl} alt={destination.destinationName} /> : null}
				<div className="destination-scrim" />
				<div className="destination-info">
					{cardSize === 'featured' ? <span className="top-pick-label">{t('home.dispatches.topPick')}</span> : null}
					<h3>{destination.destinationName}</h3>
					<p>
						{destination.destinationCountry} · {t('home.dispatches.views', { count: destination.destinationViews ?? 0, formatted: formatNumber(destination.destinationViews ?? 0, { notation: 'compact', maximumFractionDigits: 1 }) })}
					</p>
				</div>
			</button>
		);
	};

	return (
		<section className="live-dispatches-section">
			<div className="section-container">
				<RevealOnScroll distance={16}>
					<div className="section-header">
						<div>
							<span className="section-tag">{t('home.dispatches.eyebrow')}</span>
							<h2 className="section-title">{t('home.dispatches.title')}</h2>
							<p className="section-subtitle">{t('home.dispatches.description')}</p>
						</div>
					</div>
				</RevealOnScroll>

				{loading ? <p className="destinations-empty-state">{t('home.dispatches.loading')}</p> : null}
				{!loading && error ? <p className="destinations-empty-state">{t('home.dispatches.unavailable')}</p> : null}

				{isMobile ? (
					<div className="dispatches-mobile-swiper">
						<Swiper
							modules={[A11y, Keyboard]}
							keyboard={{ enabled: true }}
							spaceBetween={10}
							slidesPerView="auto"
							slidesOffsetBefore={16}
							slidesOffsetAfter={16}
							className="dispatches-swiper"
						>
							{destinations.map((destination, index) => (
								<SwiperSlide key={destination._id}>
									<div className="dispatch-mobile-card-wrap">
										{renderDispatchCard(destination, index)}
									</div>
								</SwiperSlide>
							))}
						</Swiper>
					</div>
				) : (
					<StaggerContainer className="travelers-destination-grid">
						{destinations.map((destination, index) => {
							const cardSize = destinationCardSizes[index] ?? 'small';

							return (
								<StaggerItem key={destination._id} className={`dispatch-item ${cardSize}`}>
									<HoverLift y={-4} scale={1.01} style={{ width: '100%', height: '100%' }}>
										{renderDispatchCard(destination, index)}
									</HoverLift>
								</StaggerItem>
							);
						})}
					</StaggerContainer>
				)}

				{!loading && !error && destinations.length === 0 && (
					<p className="destinations-empty-state">{t('home.dispatches.empty')}</p>
				)}
			</div>
		</section>
	);
};

export default LiveDispatches;
