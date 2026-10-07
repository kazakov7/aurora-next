import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_TOURS } from '../../../../apollo/user/query';
import { LIKE_TARGET_TOUR } from '../../../../apollo/user/mutation';
import { userVar } from '../../../../apollo/store';
import { Tour } from '../../../types/tour/tour';
import { getImageUrl } from '../../../config';
import { sweetErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { Message } from '../../../enums/common.enum';

interface SimilarToursProps {
	currentTourId: string;
	destinationCity?: string;
}

const fallbackTourCardImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuB4mQeLNlqcL35lcoC4r5uWUbz01iqRkLDT-TEhpqNztZgu5Bb4duTMHeCeiookjJXx6giGVOCtjaVu1lh4JdDuWjqL_y1GF4b4fe7egfBPg4ifWTZilLBgiHoKap80xIIJ0N3dCxAQ7P5W9tXpkQtkQ8JiTBAUGuq9OzoCfzjQNxHHSDl_hXCxjCZg1mloaPQaLwjVfJM0mb3JRsQXBItypeeXNSPKJzw3iw6mtc_E9aoRKVPnBnS_',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuC6MfMz_eHMiVyrZb4YyQAspcITTze6kXI-yckRvjfYCDsFBmNEEhDW70dCRjTgh3f1TBU37ZOBfgJDg1VItDSd8ks-QxiVdZ1zhKqEnz0tJ-n6iPSOfATF2fSwiMGtQ5AhcS8hOFcw_KpxIDMq_3ulJzisORvbgcMzpjDyneNcndiYC3Lqi1PrI3VLfZrSYjdD2sMJ1Twfc4wJLZ4e0Z-aldIu_1X2zNyB-ve22TpcvuGbA6DvMYJq',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCDb_wgMJO-gL7Beemfp6HLXq7V6e7j5m5dEyqpSbCFrpzrCOE1hlkuchOwCO9_Z_Xe-8lgAaOtg9c1gctP06g10ME964RB5e30w6Y5raKutQDd5t8JHxcKXCmvYWBQHVvPnKOSYTLMHhkrzfAhidyD3eiqTy37WFa8gi8noEEuHW1LK9pB-T0fp1spauZDsf1uedNYpf4EHcAQYMzDfyP7sIsNAxlEWmqONCWGdJ5oXXAc2Y4whBT-',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuBBg-JiWWW-6d_L1mQUaBUkP1cNBWfX7daHk2QG-hZ9BxZNZxoGZsavKdAi-9zOspp8xZs26UPg51m1NQAL1TF3TzO2P9id4B0vlFtW_kX0r7ouvN9hKNR6I_U_kMGtPOPXU5pr04BsJ-UIHY1M9tnXcirAmuK6M5P3uguHF0P8X0VKNFVytuTMRr8QAlRS7IIRJ1RZvfMK7LQu0qbRCV8rWfmSI3f2_hxycc3Ryh9qRUsRiIiCMjim',
];

const SimilarTours = ({ currentTourId, destinationCity }: SimilarToursProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const [likeTargetTour] = useMutation(LIKE_TARGET_TOUR);

	const { data } = useQuery(GET_TOURS, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				page: 1,
				limit: 5,
				search: {},
			},
		},
	});

	const rawList: Tour[] = data?.getTours?.list || [];
	const similarList = rawList
		.filter((t: Tour) => t._id !== currentTourId)
		.slice(0, 4);

	const handleLike = async (e: React.MouseEvent, id: string) => {
		e.stopPropagation();
		if (!user?._id) {
			await sweetErrorAlert(Message.NOT_AUTHENTICATED);
			return;
		}
		try {
			await likeTargetTour({ variables: { tourId: id } });
			await sweetTopSmallSuccessAlert('Saved to wishlist!');
		} catch (err: any) {
			await sweetErrorAlert(err.message || 'Error occurred');
		}
	};

	const formatDuration = (tour: Tour) => {
		if (tour.tourStartDate && tour.tourEndDate) {
			const start = new Date(Number(tour.tourStartDate) || tour.tourStartDate);
			const end = new Date(Number(tour.tourEndDate) || tour.tourEndDate);
			const diffDays = Math.max(
				1,
				Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
			);
			const nights = Math.max(1, diffDays - 1);
			return `${nights}N ${diffDays}D`;
		}
		return '6N 7D';
	};

	return (
		<section className="similar-tours-section">
			<div className="section-header-row">
				<div>
					<h2 className="section-heading">Similar Tours</h2>
					<p className="section-subtext">More adventures you might love.</p>
				</div>
				<Link href="/tour" className="view-all-link">
					<span>View All Tours</span>
					<span className="material-symbols-outlined">arrow_forward</span>
				</Link>
			</div>

			<div className="similar-tours-grid">
				{similarList.map((item: Tour, idx: number) => {
					const fallback = fallbackTourCardImages[idx % fallbackTourCardImages.length];
					const cardImg = getImageUrl(item.tourImages?.[0], fallback);
					const isLiked = item.meLiked && item.meLiked[0]?.myFavorite;
					const rating = item.tourRating ? item.tourRating.toFixed(2) : '4.95';

					return (
						<article
							key={item._id}
							className="similar-tour-card"
							onClick={() => router.push(`/tour/detail?id=${item._id}`)}
						>
							<div className="card-image-box">
								<img
									src={cardImg}
									alt={item.tourName}
									className="card-img"
								/>
								<span className="card-dest-pill">
									{item.tourDestinationCity || 'Alpine Enclave'}
								</span>
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
									<span className="duration-capacity">
										{formatDuration(item)} · Max {item.tourCapacity || 14} Guests
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

								<h3 className="card-title">{item.tourName}</h3>
								<p className="card-subtitle">
									{item.tourDestinationCity ? `${item.tourDestinationCity} expedition` : 'Curated Alpine journey'}
								</p>

								<div className="card-bottom-line">
									<div className="price-group">
										<span className="price-tag">
											₩{item.tourPrice?.toLocaleString()}
										</span>
										<span className="traveler-tag">/ traveler</span>
									</div>
									<span className="status-tag">Available</span>
								</div>
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default SimilarTours;
