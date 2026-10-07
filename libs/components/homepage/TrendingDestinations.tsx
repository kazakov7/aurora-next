import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_DESTINATIONS } from '../../../apollo/user/query';
import { LIKE_TARGET_DESTINATION } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Destination } from '../../types/destination/destination';
import { DestinationsInquiry } from '../../types/destination/destination.input';
import { Direction, Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface TrendingDestinationsProps {
	initialInput?: DestinationsInquiry;
}

const defaultDestinations = [
	{
		_id: 'default-1',
		destinationName: 'Kyoto Sanctuary',
		destinationCountry: 'Japan',
		destinationDesc:
			"Ancient cedar forests, temple moss gardens, and preserved ryokan hospitality nestled in Japan's cultural cradle.",
		destinationImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDg332g8Mdqa72B4EK0xfZgIvjYziK_O0yQtEa-65xaSGdp_NcEw0LD7uvIguzBI1XpGKfHibPzjPUB_PR6qFEBrt5y4y2kMaaNmfeFLrwrxAWcRs5t_BSvwGDEOXF2MvIk5PUMwMqun7Rs9pQ909eETNEZ6ZtRMZaSr1nxk3ebdGl_QTdndwfidK6rhG9ZtZIGiWu7su-4cZrY57a0OxrNH7_wA2GLNG2VJ_GhC-U',
		],
		destinationProperties: 14,
		destinationTours: 9,
		badge: 'Featured Curation',
	},
	{
		_id: 'default-2',
		destinationName: 'Amalfi Coast',
		destinationCountry: 'Italy',
		destinationDesc:
			'Terraced lemon groves carved into sheer cliffs plunging into cobalt Mediterranean waters.',
		destinationImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCNs2t8WKTlsetndoFUX4BKERo4KmHoAsPeMXLSMNuy2o95sgT2_C0dv6Zj44xLSa7d-NkjllJi2yh_krypxFhq2giyfNX0slJzUQ33YBU7EoBcTMXfR1J4PzNF76rb3CsNh9SjuCQ6tWAWVgrotcxOqh9vDMkB7SwberyRnEWWzddmVAc-IEBcHnoZ58qR0Lm0lmVbUaiRsDctttqfLX800QGexvWqtBl1frMZUJ8',
		],
		destinationProperties: 22,
		destinationTours: 11,
		badge: 'Coastal Haven',
	},
	{
		_id: 'default-3',
		destinationName: 'Reykjanes Peninsula',
		destinationCountry: 'Iceland',
		destinationDesc: 'Steam vents, volcanic horizons, and geothermal stillness.',
		destinationImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBfVNuWHBrnCvupXXE8QqcsumMqdR4mNYWnSJaGwMdAK1ZpvN0D5fwDu2G3c948R0UJb_pVu4AdK0CW80e5kT4V9vZAw9w4WLvxHALNQKKo0KFpgCvqN7yTX44Bv4isz6YQ_43TPbz49UYo6OeV36Rp5n1fgdTIks5_8TVejLIDBdmis_dd92YN_aa457fdJ6hgZ5AtatGv6PqTQTeJuy0652PVdUInhDglibERTHM',
		],
		destinationProperties: 8,
		destinationTours: 6,
		badge: 'Nordic Volcanic',
	},
	{
		_id: 'default-4',
		destinationName: 'Zermatt & The Matterhorn',
		destinationCountry: 'Switzerland',
		destinationDesc:
			'Pristine glaciated high peaks, car-free alpine hamlets, and legendary Swiss mountaineering traditions.',
		destinationImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAkmK4I-rtAv4XLNhE18VLPYsKFxwlt-obtQ_E-8SezlSQpIXmbjnDEkLgk54SvSJY3kwabKGgwHc-qR4dPYtLFQVvCd8LRphdJioJGfS_sqAKIQ1JOhy4dsDnrpecdps-aiXLrgXM18vJCwTz9gibZXM3d1RU_WY5p8_aAom2NQ8qxgdYojQx0COP_fhLBAx6fJlNRoxqB3BrA_g7o2QlcCJT_Sxp3huknDcORCv0',
		],
		destinationProperties: 31,
		destinationTours: 15,
		badge: 'Alpine Icon',
	},
];

const TrendingDestinations = ({ initialInput }: TrendingDestinationsProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [destinations, setDestinations] = useState<Destination[]>([]);

	const queryInput: DestinationsInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'destinationViews',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const [likeTargetDestination] = useMutation(LIKE_TARGET_DESTINATION);
	const { data, refetch: refetchDestinations } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const list = data?.getDestinations?.list;
		if (list && list.length > 0) {
			setDestinations(list);
		}
	}, [data]);

	/** HANDLERS **/
	const likeDestinationHandler = async (e: React.MouseEvent, destinationId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetDestination({
				variables: { destinationId },
			});
			await refetchDestinations({ input: queryInput });
			await sweetTopSmallSuccessAlert('Destination liked!', 800);
		} catch (err: any) {
			console.log('ERROR, likeDestinationHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const navigateToDestination = (dest: Destination | any) => {
		if (dest._id && !dest._id.startsWith('default-')) {
			router.push({
				pathname: '/destination',
				query: { id: dest._id },
			});
		} else {
			router.push({
				pathname: '/destination',
				query: { search: dest.destinationName },
			});
		}
	};

	// Combine real API data with fallback so 4 bento slots are always filled beautifully
	const displayList = Array.from({ length: 4 }).map((_, index) => {
		if (destinations[index]) return destinations[index];
		return defaultDestinations[index];
	});

	return (
		<section className="trending-destinations-section">
			<div className="section-container">
				{/* Section Header */}
				<div className="section-header">
					<div>
						<span className="section-tag">Curation Grid</span>
						<h2 className="section-title">Trending Destinations</h2>
					</div>
					<Link href="/destination" className="section-link">
						<span>Explore all destinations</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>

				{/* Bento Grid */}
				<div className="bento-grid">
					{/* Kyoto Card (Large - Slot 0) */}
					{displayList[0] && (
						<div
							className="bento-card col-span-7 kyoto-card cursor-pointer"
							onClick={() => navigateToDestination(displayList[0])}
						>
							<div
								className="card-bg"
								style={{
									backgroundImage: `url(${getImageUrl(
										displayList[0].destinationImages?.[0],
										defaultDestinations[0].destinationImages[0],
									)})`,
								}}
							></div>
							<div className="card-gradient"></div>
							<div className="card-content">
								<span className="card-badge">
									{(displayList[0] as any).badge || `${displayList[0].destinationCountry || 'Featured Curation'}`}
								</span>
								<h3 className="card-heading">{displayList[0].destinationName}</h3>
								<p className="card-desc">
									{displayList[0].destinationDesc ||
										`${displayList[0].destinationName} offers an extraordinary sanctuary amidst pristine landscapes.`}
								</p>
								<div className="card-stats">
									<span>{displayList[0].destinationProperties || 14} Private Stays</span>
									<span className="dot"></span>
									<span>{displayList[0].destinationTours || 9} Guided Walks</span>
								</div>
							</div>
						</div>
					)}

					{/* Amalfi Coast (Slot 1) */}
					{displayList[1] && (
						<div
							className="bento-card col-span-5 amalfi-card cursor-pointer"
							onClick={() => navigateToDestination(displayList[1])}
						>
							<div
								className="card-bg"
								style={{
									backgroundImage: `url(${getImageUrl(
										displayList[1].destinationImages?.[0],
										defaultDestinations[1].destinationImages[0],
									)})`,
								}}
							></div>
							<div className="card-gradient"></div>
							<div className="card-content">
								<span className="card-badge">
									{(displayList[1] as any).badge || `${displayList[1].destinationCountry || 'Coastal Haven'}`}
								</span>
								<h3 className="card-heading">{displayList[1].destinationName}</h3>
								<p className="card-desc">
									{displayList[1].destinationDesc ||
										`Enchanting coastal scenery and exclusive seaside retreats.`}
								</p>
								<div className="card-stats">
									<span>{displayList[1].destinationProperties || 22} Cliffside Villas</span>
								</div>
							</div>
						</div>
					)}

					{/* Reykjanes Peninsula (Slot 2) */}
					{displayList[2] && (
						<div
							className="bento-card col-span-4 reykjanes-card cursor-pointer"
							onClick={() => navigateToDestination(displayList[2])}
						>
							<div
								className="card-bg"
								style={{
									backgroundImage: `url(${getImageUrl(
										displayList[2].destinationImages?.[0],
										defaultDestinations[2].destinationImages[0],
									)})`,
								}}
							></div>
							<div className="card-gradient"></div>
							<div className="card-content">
								<span className="card-tag">
									{(displayList[2] as any).badge || `${displayList[2].destinationCountry || 'Nordic Haven'}`}
								</span>
								<h3 className="card-heading-sm">{displayList[2].destinationName}</h3>
								<p className="card-desc">
									{displayList[2].destinationDesc ||
										`Untamed nature, geothermal springs, and boundless tranquility.`}
								</p>
							</div>
						</div>
					)}

					{/* Zermatt (Slot 3) */}
					{displayList[3] && (
						<div
							className="bento-card col-span-8 zermatt-card cursor-pointer"
							onClick={() => navigateToDestination(displayList[3])}
						>
							<div
								className="card-bg"
								style={{
									backgroundImage: `url(${getImageUrl(
										displayList[3].destinationImages?.[0],
										defaultDestinations[3].destinationImages[0],
									)})`,
								}}
							></div>
							<div className="card-gradient-right"></div>
							<div className="card-content">
								<span className="card-badge">
									{(displayList[3] as any).badge || `${displayList[3].destinationCountry || 'Alpine Icon'}`}
								</span>
								<h3 className="card-heading">{displayList[3].destinationName}</h3>
								<p className="card-desc">
									{displayList[3].destinationDesc ||
										`Pristine glaciated high peaks, car-free alpine hamlets, and legendary hospitality.`}
								</p>
								<div className="card-actions">
									<span className="highlight-text">
										{displayList[3].destinationProperties || 31} Bespoke Chalets
									</span>
									<span className="view-collection-link">
										<span>View Collection</span>
										<span className="material-symbols-outlined">chevron_right</span>
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</section>
	);
};

export default TrendingDestinations;
