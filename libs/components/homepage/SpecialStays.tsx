import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROPERTIES } from '../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { PropertiesInquiry } from '../../types/property/property.input';
import { Direction, Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface SpecialStaysProps {
	initialInput?: PropertiesInquiry;
}

const defaultStays = [
	{
		_id: 'default-stay-1',
		propertyName: 'The Glass House',
		propertyCity: 'Lyngen Alps, Norway',
		propertyDesc: 'Panoramic fjord views with geothermal floor heating and uninterrupted aurora vistas.',
		pricePerNight: 680,
		currency: 'USD',
		propertyRating: 4.98,
		propertyImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAqes-3wwKqJvCe6tShwC1xEN2ZDVYpd1ipJRxgwFOwL9K_3Gs2R9uzvVr6Y7dY47yTyN_rfUppoeHpywrZ2HvpT_RYusicD4x292XhrgUaoy37_zpsOucDtMfJAg3OMVxbk7pxdLb9bPlcbQOi7jqaoxu86uaKDJHV3sdQRk5B0ZVxtEdq822O-BwfyTqZjNOnN8Oi95z4iUOpCWl0g6S-PRXV4jM_uA1Dci7bE8I',
		],
	},
	{
		_id: 'default-stay-2',
		propertyName: 'Villa Caelum Cliffside',
		propertyCity: 'Santorini, Greece',
		propertyDesc: 'Sculpted caldera enclave with private infinity plunge pool and chef-attended terraces.',
		pricePerNight: 920,
		currency: 'USD',
		propertyRating: 4.95,
		propertyImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDf1mdn28RW4s8Lq_9bJVhe3jbk3feNpCE43ELz24JDv1c-17C_UsEILfPPF790Z5ppdDHw3f7ezeg_E-pZ6PVg8pkp1rZ8FCVPa63riSUnIMatKwZ01z3rXDl_hQS-ceXConjL46YxAOZELPTicOgfoRRqBF2JEDCXFhkPQ8dJZW8B3vtKwRGvK2IfS7CcqMfVPIXnxu_AXMi0Z92Tc-MLOvrg_G4yu--s0U6K1tY',
		],
	},
	{
		_id: 'default-stay-3',
		propertyName: 'Aman Kyoto Forest',
		propertyCity: 'Kyoto, Japan',
		propertyDesc: 'Lush secret garden pavillion with private outdoor cedar ofuro soaking tubs and tea pavilions.',
		pricePerNight: 1150,
		currency: 'USD',
		propertyRating: 5.0,
		propertyImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBCc9hakH44WAnnwF6rXU-1HsCVffIf8SOQ0adt1DwujROVj_PbLtDH6uvM8yQss2wGkeWbBWqZNDCa1eDIQ-Y0dPYHDgJW1IM9fpes5-RfloYmE0NBFuXfNtUY9gosss2cEfEIGI-7Qx2MZsTN7tgSrLkuEjW_H5e1Wl_BbdRfH-f-CHcwgS0ppJpv1-6ey1Ikc1TYCayToLtahMOJo1M1aGmX1PiRBqcwwwvS7hI',
		],
	},
	{
		_id: 'default-stay-4',
		propertyName: 'Fogo Island Wilderness',
		propertyCity: 'Newfoundland, Canada',
		propertyDesc: 'Cantilevered modernist haven set atop granite coastline with local foraged gastronomy.',
		pricePerNight: 840,
		currency: 'USD',
		propertyRating: 4.92,
		propertyImages: [
			'https://lh3.googleusercontent.com/aida-public/AB6AXuANJ3UOFnuCnjCE4t3LChsoSZjqksSH8PcmpI-xYUnCyY0ttqsG5Qh7oSBcVuFHBhAP34SuZGgl7XdOH-XSKuVzw1Yr06XjTyh-1vO8aqWHcyTnzs-2LLCgi84V2xCS95i6BI8CIq55Gd8nY-FCsLFkzgOhnaLNbK_M63cMCWYkYW5_ZFGYQvSN6JgzL_PnOhLBT9rbBHJD-nk1670TQquMTcbII6EodntkC6ALoCY',
		],
	},
];

const SpecialStays = ({ initialInput }: SpecialStaysProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [properties, setProperties] = useState<Property[]>([]);

	const queryInput: PropertiesInquiry = initialInput || {
		page: 1,
		limit: 4,
		sort: 'propertyViews',
		direction: Direction.DESC,
		search: {},
	};

	/** APOLLO REQUESTS **/
	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);
	const { data, refetch: refetchProperties } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: queryInput },
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const list = data?.getProperties?.list;
		if (list && list.length > 0) {
			setProperties(list);
		}
	}, [data]);

	/** HANDLERS **/
	const likePropertyHandler = async (e: React.MouseEvent, propertyId: string) => {
		e.stopPropagation();
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			await likeTargetProperty({
				variables: { propertyId },
			});
			await refetchProperties({ input: queryInput });
			await sweetTopSmallSuccessAlert('Saved to favorites!', 800);
		} catch (err: any) {
			console.log('ERROR, likePropertyHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const pushDetailHandler = (stay: Property | any) => {
		if (stay._id && !stay._id.startsWith('default-')) {
			router.push({
				pathname: '/property/detail',
				query: { id: stay._id },
			});
		} else {
			router.push('/property');
		}
	};

	const displayStays = Array.from({ length: 4 }).map((_, index) => {
		if (properties[index]) return properties[index];
		return defaultStays[index];
	});

	return (
		<section className="special-stays-section">
			<div className="section-container">
				{/* Section Header */}
				<div className="section-header">
					<div>
						<span className="section-tag">Sanctuaries &amp; Retreats</span>
						<h2 className="section-title">Stay Somewhere Special</h2>
						<p className="section-subtitle">
							Architectural marvels and tranquil sanctuaries curated for silence and form.
						</p>
					</div>
					<Link href="/property" className="section-link">
						<span>Browse all stays</span>
						<span className="material-symbols-outlined">arrow_forward</span>
					</Link>
				</div>

				{/* Cards Grid */}
				<div className="stays-grid">
					{displayStays.map((stay: any, idx: number) => {
						const isLiked = stay?.meLiked && stay?.meLiked[0]?.myFavorite;
						const imageUrl = getImageUrl(
							stay.propertyImages?.[0],
							defaultStays[idx % defaultStays.length].propertyImages[0],
						);

						return (
							<div
								key={stay._id || idx}
								className="stay-card cursor-pointer"
								onClick={() => pushDetailHandler(stay)}
							>
								<div className="card-image-box">
									<img
										src={imageUrl}
										alt={stay.propertyName}
										className="stay-img"
										onError={(e: any) => {
											e.target.src = defaultStays[idx % defaultStays.length].propertyImages[0];
										}}
									/>
									<span className="location-badge">
										{stay.propertyCity || stay.propertyAddress || 'Global Sanctuary'}
									</span>
									<button
										aria-label="Save stay"
										className={`favorite-btn ${isLiked ? 'liked' : ''}`}
										type="button"
										onClick={(e) => likePropertyHandler(e, stay._id)}
									>
										<span
											className="material-symbols-outlined"
											style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
										>
											favorite
										</span>
									</button>
								</div>

								<div className="card-body">
									<div className="card-top-row">
										<h3 className="stay-title">{stay.propertyName}</h3>
										<div className="rating-box">
											<span
												className="material-symbols-outlined star-icon"
												style={{ fontVariationSettings: "'FILL' 1" }}
											>
												star
											</span>
											<span className="rating-num">
												{stay.propertyRating ? stay.propertyRating.toFixed(2) : '4.95'}
											</span>
										</div>
									</div>

									<p className="stay-desc">
										{stay.propertyDesc ||
											`${stay.propertyName} offers bespoke accommodations with refined amenities and elevated service.`}
									</p>

									<div className="card-bottom-row">
										<div className="price-box">
											<span className="price-val">
												{stay.currency === 'KRW' ? '₩' : '$'}
												{stay.pricePerNight?.toLocaleString()}
											</span>
											<span className="price-unit"> / night</span>
										</div>
										<button
											className="reserve-btn"
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												pushDetailHandler(stay);
											}}
										>
											Reserve
										</button>
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default SpecialStays;
