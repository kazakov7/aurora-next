import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_PROPERTIES } from '../../../../apollo/user/query';
import { LIKE_TARGET_PROPERTY } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Property } from '../../../types/property/property';
import { getImageUrl } from '../../../config';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { Message } from '../../../enums/common.enum';

interface SimilarPropertiesProps {
	currentPropertyId: string;
	city?: string;
}

const fallbackImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuC6MfMz_eHMiVyrZb4YyQAspcITTze6kXI-yckRvjfYCDsFBmNEEhDW70dCRjTgh3f1TBU37ZOBfgJDg1VItDSd8ks-QxiVdZ1zhKqEnz0tJ-n6iPSOfATF2fSwiMGtQ5AhcS8hOFcw_KpxIDMq_3ulJzisORvbgcMzpjDyneNcndiYC3Lqi1PrI3VLfZrSYjdD2sMJ1Twfc4wJLZ4e0Z-aldIu_1X2zNyB-ve22TpcvuGbA6DvMYJq',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAMs7i82_48QvM8GvR3vR6WJg3q1jYk3qR5g9Z1X2c3v4B5n6m7k8L9a0B1c2D3e4F5g6H7i8J9k0L1m2N3o4P5q6R7s8T9u0V1w2X3y4Z5',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAsCBHB3vEewr28dCwWs12RQO5JKVizgb2pbTYUYQrCxMLEkNUbD_Izi-gZTMYRBYaEzpsl7T1D51_WTHUp1680bG4iJifsNTWQ0vdZAIJ-RWCkuLnFfgEq4TJpUQ3mMHhfX1EdujxY4SaSffh8QYgTNSvxDB_pWUnpNgbW13xoJCen3x3vVHQwqEEKxTpGNMv0H0sYygEhVXjdbRYYzUrBhBnZwwhlhSz2xretzkgkfzl3ElpJhVJx',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAEud2Q0wvg4RjwpdPtOFNxGUUuVQmy8QD6ZEgRxMI44sLVrGtRPLH31hWGORdCJ2ErXxdg6EuTrw66IiCLobzHqlkgGrpHqMLtaxyoBJycvaKDpRDTBbcgVwF7gUjpJ6LAR6QhPAFn_UX89RZPZY1uIhjnEj5FhiymYrN2HL-k2xlViHUWgm9sPn_Up0p5DPbSuXSgf98s9grykamN9AFMHafl6s-cnxLtsECpDKOVYUlMH4Doro9P',
];

const SimilarProperties = ({ currentPropertyId, city }: SimilarPropertiesProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [likeTargetProperty] = useMutation(LIKE_TARGET_PROPERTY);

	const { data, loading } = useQuery(GET_PROPERTIES, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				search: {},
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
			await sweetTopSmallSuccessAlert('Saved to wishlist!');
		} catch (err: any) {
			await sweetErrorAlert(err.message || 'Error occurred');
		}
	};

	return (
		<section className="similar-properties-section">
			<div className="section-header-row">
				<div>
					<h2 className="section-heading">Similar Hotels</h2>
					<p className="section-subtext">Curated architectural stays in alpine and glacial terrains</p>
				</div>
				<Link href="/property" className="view-all-link">
					<span>View All Hotels</span>
					<span className="material-symbols-outlined">arrow_forward</span>
				</Link>
			</div>

			<div className="similar-grid-row">
				{similarList.map((item: Property, idx: number) => {
					const fallback = fallbackImages[idx % fallbackImages.length];
					const cardImg = getImageUrl(item.propertyImages?.[0], fallback);
					const isLiked = item.meLiked && item.meLiked[0]?.myFavorite;
					const rating = item.propertyRating ? item.propertyRating.toFixed(2) : '4.95';

					return (
						<article
							key={item._id}
							className="similar-card"
							onClick={() => router.push(`/property/detail?id=${item._id}`)}
						>
							<div className="card-image-box">
								<img
									src={cardImg}
									alt={item.propertyName}
									className="card-img"
								/>
								<span className="card-city-pill">{item.propertyCity || 'Alpine Enclave'}</span>
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
										{item.maxGuests || 4} Guests · {item.bedrooms || 2} Beds
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
								<p className="card-type">{item.propertyType || 'Modernist Chalet'}</p>

								<div className="card-bottom-price">
									<span className="price-tag">
										₩{item.pricePerNight?.toLocaleString()}
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
