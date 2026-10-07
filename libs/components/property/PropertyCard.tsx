import React from 'react';
import { useRouter } from 'next/router';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { Property } from '../../types/property/property';
import { getImageUrl } from '../../config';

interface PropertyCardProps {
	property: Property;
	index?: number;
	likePropertyHandler: (e: React.MouseEvent, id: string) => void;
}

const fallbackCardImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDKca179BHZ2qVbltTNcFEAj8KX70i7_KBxtkQJppUNGDkX0xADJ_79E5z61eAaXH4FeZWBmI19qXctdz7Goi4SzV6HksCLRILHgOGFLPePZ4hR6-UkqFiZacpWCVPKz9qGlyL-ld88G9bhPULrW74tCeBzS4RnWCiTTp1JllCozvPo2YBHHwlTkEeu5o_uFTq4yYevp2QV1KAs90EcIb1X555CdAVCCkEqh7ctZxe2sKOelpEHfG0J',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAKFJJvgFUfYGA0iJlZ1Xy4WCelCwnsA4Oh-lzVeP_-oUZtlc-Xd_Y0jtLFl1dZVCuldvrsXQ54m4_mDpZ6Du1mtJ1M0aKgLSm9nfoE85SfVnS-ZnoRFiNZyLxbCCzgfDmWuhc9LnNqSsQ1550FA3DhQFZsPGiyBevIMUvmY9K62KinaDlIgY_pbZlb8CS-u5eYQnzvg-kut_-iOvxQof1s7mE1a_3qf8gkUsHrkqPVrgd78KKUw_LV',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuC6mas5lOlEYhxMBQUBTh10jJTMZwnsZEysrz4l994LtoCsQ_eWCWfudc2mgP4uvbo5KxLCY1Gl4IvZko8DO4CmrbIWijbHlEcjFA3DtAtE5nCxnspMgPPffwP0yd4ctKtkLoM8dBw2Urn7KbB5LiIh1zFqnLK7CNJdLVL2OveAhQOVuCkTmywFFgRePLP6k8mgg4_zv8CDQfutRVZBqASsHOsSIod-Xe3F6JXiAB_j1A5cyv6GA-qW',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuDe1ExmYbfWGLeqJZr6dJov95ynQfr8N7sco1cK8ypIAs_G3pmn3fYkxD4XUKE9DrlKO3eQVnSv3rJ_dgXylzlD7ej6Gj0qUUes0rjZyYX3ev0bTL4Uj36an7WSnSUTN5b6D5BKOTaBZtDxn-NaH21Q5cISWuavViruanYSlOPMWqiH1QtB0KxDuxu3wqIVOEN0jitHXXwD80yjZNk0YzwFmkc71K85udjq24X_ULhlSTKOqZYBeoa8',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBV__3UfD7MoYP-lXRKk5mO8_plji6lwDtfeha_mGD_WrCXEV1lmnXwZT6InY-yrOcnvJj_7RIYtAoAX99a74zfyWySeFhnul4Rv8LKQnKCGcmMouUukX3Q9JHU_PWR7HdI8IHA0hqoJ7famEDWWaKTSXNK87ln28bnPKOgU3aS4kXzlOn3QKKVoIASIWPXDmukAydPGNhY4uCQr8YC_zDdRWxQQMEjCN9hf3FS7RE7x9icrx_Yyiif',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBZgVGhWAfCMXZPOG0fDAaLyAt0D38IYnnM0h6wzgHcHsOUZr5GnERml03MNyQiuSMYGTM5JOvqDi4tzm7xuDwfdRdPK7QOwFXlpSn-iZrV6yKXb_R1E7SWlo4y5vmgz9Rex9lxpTfD9yN0Z1zIMaX0gaMTFQceBpnk2l9ebh39Qv7vvI0EaKVmUuLUiElIiZ8NFEh6dgChJ8bXgaPxlqyrHjEIHwKnAD2JLyD05-rn1Q92Uz5cwE4w',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD0v6KJj-9R6AHKLEkE_AbqXbBxQigf9poVhJAl6J0qdDa9ONc_Kojd2_zyQDFGmuG-_5slKnTekVFRt_0aXU1hrE-JoEMgZky--8x-trMsLOC9VWekxgLsscMsy0Xs_t7wnVNTlf7zqdaW0ICLBW6uSNzjycoe_hsDtdBdHYoPuaRx3rnoW3Fll5OqVMhwqpEPvwJtJ9KrkJIl_pVy73moadkl9yiy8GEZxKpbr-WFLIeXjcM_r1Sw',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBuezU2-Fd1kX0MEKuZz4Mnh5_9D7P3GWJTew5XWBCZtR83J2EC6bZNzt1x_hAXcwnzFa6uSd2To3RCRgmmQUZqay9YNuQ_o4VS5BjA9dOo47dDAtrzrwm2HphkTbG_59LdhdF7hu5-RxhUBfZCB3oAGCTT7raIxl1158QleM3AX8vIAfpwjrKv0RjtEN49pBLQTd2CvA5kc1SdLNR0JDusq2IK0PPK_7QDzwgeefiarNqHt7wQM4IH',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBFZ-kQH3TfMCf0a1JGcNwMeH8SX2Hw16bXT-T2BbeDGf1h95TwAQPGD6ZATt3G1bd8S4zweTkHeT3if3oW35xLAmRL2NZVSgAoDFt95f1jGPCES1bozaJafkXOoYzpVRTrvmLTPdR2JE5vePbMrwWwn09pE-fQBKjXNgFDAHlhNFNbr5IdM7sUR0tH5dQeUnbAWuxZjWmiyr6cWFLBfZ37E7FsWNaMU6JZ6JiZ6w9dlGdLa0JhnePA',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCkGyv9TLDPj190x4YUWjMyjjjVChQsGrCbwWDVzcI9r79g9UIZUTF7sXzM6Y5BT7r1ao5gomalu0ZiFqDer0s5ZFEj5FBEcDoyZeosryCyGo9m0wpiJsgikmsAIUpiO-0ICNK9pnTtTaN1hLZ1f1HVaV_ZbpuV9bWcHj0klPfIibYR8MlrXECeJbZOgNDCr9cER8Wa1Yce__M7R_35M2gBA8UXePcmu0o8TnjVrTAYOarjwRteMeWy',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCPNumyb37Ff7UFs09Q10vjzr47KIafUfssrd7c4rNQTIrZn2bVWD5mN2A2GsyDdE9QwOqNp792zJ4moDS5o--DP43QGWEoKM307MxvSqlaC2qlmIWMEDTc4gDzDU8rpm3B4c0AI9Aaael1f23y6DJNb59WQUL_dGfYVx_UQS3BNtUfwycoybtQar_1wQxJuHHOL-BPBbhUnOxgSC_BlqNq7072EHXgRVmNS5VeWb7BYjGXMNPbpY3_',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuATsbbaE9p3G-KsNkZDVNOc2jSEBpTNkm05noLE3qUCEnsUoEn5CDmThszcpzVkzvwEYvkAjm6P324fZgYSg1U2P7tE88lGqyF2mTl3AaJGDiWVMEX6q729tmBlWeGyuA9h8rRDXBvQ8dT_KOXkqv6eVKvHBRsWoMAbzsS77iqwCGSDWmC-eWC33LOOEy8PowbH3BDv7KGFj6jTV-VgjJdZimJ3VM8LKP_CxvuR0ZqIM6Dj8sARLThB',
];

const badges = ['Best Price', 'Rare Find', 'Curated', 'Popular'];

const PropertyCard = ({ property, index = 0, likePropertyHandler }: PropertyCardProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isLiked = property?.meLiked && property?.meLiked[0]?.myFavorite;

	const fallbackImg = fallbackCardImages[index % fallbackCardImages.length];
	const imageSrc = getImageUrl(property.propertyImages?.[0], fallbackImg);
	const badgeText = badges[index % badges.length];

	const ratingVal = property.propertyRating ? property.propertyRating.toFixed(2) : '4.96';
	const reviewsCount = property.propertyReviews || (80 + (index * 17) % 150);

	/** HANDLERS **/
	const pushDetailHandler = () => {
		router.push({
			pathname: '/property/detail',
			query: { id: property._id },
		});
	};

	return (
		<article className="hotel-card" onClick={pushDetailHandler}>
			<div className="card-image-wrapper">
				<img
					src={imageSrc}
					alt={property.propertyName}
					className="card-img"
					onError={(e: any) => {
						e.target.src = fallbackImg;
					}}
				/>
				<div className={`card-badge-pill ${badgeText.toLowerCase().replace(' ', '-')}`}>
					{badgeText}
				</div>
				<button
					aria-label="Save to favorites"
					className={`card-favorite-btn ${isLiked ? 'liked' : ''}`}
					type="button"
					onClick={(e) => likePropertyHandler(e, property._id)}
				>
					<span
						className="material-symbols-outlined"
						style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
					>
						favorite
					</span>
				</button>
			</div>

			<div className="card-content">
				<div className="card-top-section">
					<div className="title-rating-row">
						<h3 className="card-title">{property.propertyName}</h3>
						<div className="card-rating">
							<span className="star-icon">★</span>
							<span className="rating-value">{ratingVal}</span>
							<span className="reviews-count">({reviewsCount})</span>
						</div>
					</div>

					<div className="location-info-row">
						<span className="distance-info">0.8 km from center</span>
						<span className="view-map-link">
							<span className="material-symbols-outlined">location_on</span> View map
						</span>
					</div>

					<div className="card-divider"></div>

					<div className="address-row">
						<span className="material-symbols-outlined">pin_drop</span>
						<span className="address-text">
							{property.propertyCity ? `${property.propertyCity}, ` : ''}
							{property.propertyAddress || 'Sanctuary Enclave'}
						</span>
					</div>

					<div className="tags-row">
						<span className="tag-pill">{property.propertyType || 'Deluxe Suite'}</span>
						{property.amenities && property.amenities[0] && (
							<span className="tag-pill">{property.amenities[0]}</span>
						)}
						<span className="tag-pill tag-free">Free cancellation</span>
					</div>
				</div>

				<div className="card-bottom-section">
					<div className="card-divider"></div>
					<div className="price-reserve-row">
						<div className="price-box">
							<div className="price-main">
								<span className="price-prefix">From</span>
								<span className="price-amount">
									₩{property.pricePerNight?.toLocaleString()}
								</span>
								<span className="price-suffix">/ night</span>
							</div>
							<span className="price-sub">taxes included</span>
						</div>
						<button
							className="reserve-action-btn"
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								pushDetailHandler();
							}}
						>
							Reserve
						</button>
					</div>
				</div>
			</div>
		</article>
	);
};

export default PropertyCard;
