import React, { useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../../apollo/store';
import { CREATE_DESTINATION_REVIEW } from '../../../../apollo/user/mutation';
import { sweetErrorAlert } from '../../../sweetAlert';
import { Message } from '../../../enums/common.enum';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../config';
import { useI18n } from '../../../i18n';

interface DestinationReviewItem {
	_id: string;
	memberId: string;
	reviewRating: number;
	reviewContent?: string;
	createdAt: Date | string;
	memberData?: {
		_id: string;
		memberNick: string;
		memberFullName?: string;
		memberImage?: string;
	};
}

interface DestinationReviewsProps {
	destinationId: string;
	destinationName: string;
	reviews: DestinationReviewItem[];
	totalReviews: number;
	averageRating: number;
	onReviewAdded: () => void;
}

const defaultUserAvatar = DEFAULT_USER_AVATAR;

const ratingLabelKeys: Record<number, string> = {
	1: 'destinations.reviews.rating.1',
	2: 'destinations.reviews.rating.2',
	3: 'destinations.reviews.rating.3',
	4: 'destinations.reviews.rating.4',
	5: 'destinations.reviews.rating.5',
};

const DestinationReviews = ({
	destinationId,
	destinationName,
	reviews,
	totalReviews,
	averageRating,
	onReviewAdded,
}: DestinationReviewsProps) => {
	const { t, tError, formatRelativeTime } = useI18n();
	const user = useReactiveVar(userVar);
	const [selectedRating, setSelectedRating] = useState<number>(5);
	const [reviewText, setReviewText] = useState<string>('');
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [likedThumbs, setLikedThumbs] = useState<Record<string, boolean>>({});

	const [createDestinationReview] = useMutation(CREATE_DESTINATION_REVIEW);

	const handleStarClick = (rating: number) => {
		setSelectedRating(rating);
	};

	const handleSubmitReview = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!reviewText.trim()) return;

		try {
			if (!user?._id) throw new Error(t(Message.NOT_AUTHENTICATED));

			setSubmitting(true);
			await createDestinationReview({
				variables: {
					input: {
						destinationId,
						reviewRating: selectedRating,
						reviewContent: reviewText.trim(),
					},
				},
			});

			setReviewText('');
			onReviewAdded();
		} catch (err: any) {
			console.log('ERROR, createDestinationReview:', err.message);
			sweetErrorAlert(tError(err));
		} finally {
			setSubmitting(false);
		}
	};

	const toggleThumb = (reviewId: string) => {
		setLikedThumbs((prev) => ({
			...prev,
			[reviewId]: !prev[reviewId],
		}));
	};

	const userAvatar = getImageUrl(user?.memberImage, defaultUserAvatar);
	const avgScore = (averageRating || 4.9).toFixed(1);

	return (
		<section className="destination-reviews-section" id="traveler-comments">
			{/* Section Header & Aggregate Rating */}
			<div className="reviews-header-bar">
				<div>
					<div className="title-with-pill">
						<h2 className="reviews-main-title">{t('destinations.reviews.title')}</h2>
						<span className="community-badge-pill">{t('navigation.community')}</span>
					</div>
					<p className="reviews-sub-title">
						{t('destinations.reviews.subtitle')}
					</p>
				</div>

				{/* Aggregate Score Badge */}
				<div className="aggregate-score-badge">
					<div className="score-number-box">{avgScore}</div>
					<div className="score-details-box">
						<div className="stars-group">
							{[1, 2, 3, 4, 5].map((s) => (
								<span
									key={s}
									className="material-symbols-outlined icon-star"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									star
								</span>
							))}
						</div>
						<span className="reviews-tally-label">
							{totalReviews > 0 ? t('destinations.reviews.verifiedRatings', { totalReviews }) : t('destinations.reviews.curatedRatings')}
						</span>
					</div>
				</div>
			</div>

			{/* Compact Rate & Write Review Card */}
			<div className="review-composer-card">
				<form onSubmit={handleSubmitReview} className="composer-form">
					<div className="composer-top-row">
						<div className="rating-select-area">
							<span className="rate-prompt-text">{t('destinations.reviews.rateThisDestination')}</span>
							<div className="interactive-stars-row">
								{[1, 2, 3, 4, 5].map((star) => (
									<button
										key={star}
										type="button"
										className="star-click-btn"
										onClick={() => handleStarClick(star)}
										aria-label={t('destinations.reviews.star', { star })}
									>
										<span
											className="material-symbols-outlined star-icon"
											style={{
												fontVariationSettings: star <= selectedRating ? "'FILL' 1" : "'FILL' 0",
												color: star <= selectedRating ? '#f59e0b' : '#bfc7d2',
											}}
										>
											star
										</span>
									</button>
								))}
							</div>
							<span className="selected-rating-text">
								{ratingLabelKeys[selectedRating] ? t(ratingLabelKeys[selectedRating]) : `${selectedRating}.0 / 5.0`}
							</span>
						</div>

						<span className="user-login-indicator">
							{user?.memberNick ? t('destinations.reviews.loggedInAs', { memberNick: user.memberNick }) : t('destinations.reviews.signInToPostNote')}
						</span>
					</div>

					<div className="composer-input-row">
						<img src={userAvatar} alt={t('destinations.reviews.user')} className="composer-user-avatar" />
						<div className="input-field-wrapper">
							<input
								type="text"
								className="composer-text-input"
								placeholder={t('destinations.reviews.placeholder', { destinationName })}
								value={reviewText}
								onChange={(e) => setReviewText(e.target.value)}
								disabled={submitting}
								required
							/>
							<button
								type="submit"
								className="composer-submit-icon-btn"
								disabled={submitting}
								aria-label={t('destinations.reviews.submitNote')}
							>
								<span className="material-symbols-outlined">arrow_upward</span>
							</button>
						</div>

						<button
							type="submit"
							className="composer-post-btn"
							disabled={submitting}
						>
							{submitting ? t('common.posting') : t('destinations.reviews.postNote')}
						</button>
					</div>
				</form>
			</div>

			{/* Reviews List */}
			<div className="reviews-list-container">
				{reviews.length === 0 ? (
					<div className="empty-reviews-box">
						<span className="material-symbols-outlined icon-empty">chat</span>
						<h3 className="empty-title">{t('destinations.reviews.noTravelerNotesYet')}</h3>
						<p className="empty-desc">
							{t('destinations.reviews.beTheFirst', { destinationName })}
						</p>
					</div>
				) : (
					reviews.map((rev) => {
						const authorName = rev.memberData?.memberFullName || rev.memberData?.memberNick || t('common.travelerLabel');
						const authorNick = rev.memberData?.memberNick ? `@${rev.memberData.memberNick}` : '@verified';
						const authorImg = getImageUrl(rev.memberData?.memberImage, defaultUserAvatar);
						const isLiked = !!likedThumbs[rev._id];

						return (
							<article key={rev._id} className="review-card-item">
								<div className="review-header-flex">
									<div className="author-info-flex">
										<img src={authorImg} alt={authorName} className="author-avatar" />
										<div>
											<div className="author-meta-row">
												<span className="author-name">{authorName}</span>
												<span className="author-handle">{authorNick}</span>
												<span className="meta-dot"></span>
												<span className="review-date">
													{formatRelativeTime(rev.createdAt)}
												</span>
											</div>
											<div className="stars-row">
												{[1, 2, 3, 4, 5].map((s) => (
													<span
														key={s}
														className="material-symbols-outlined star-icon-small"
														style={{
															fontVariationSettings: s <= rev.reviewRating ? "'FILL' 1" : "'FILL' 0",
														}}
													>
														star
													</span>
												))}
												<span className="rating-value-small">{rev.reviewRating}.0</span>
											</div>
										</div>
									</div>

									<button
										type="button"
										className={`thumb-like-btn ${isLiked ? 'liked' : ''}`}
										onClick={() => toggleThumb(rev._id)}
										aria-label={t('destinations.reviews.helpfulReview')}
									>
										<span
											className="material-symbols-outlined icon-thumb"
											style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}
										>
											thumb_up
										</span>
										<span className="thumb-count">{isLiked ? 1 : 0}</span>
									</button>
								</div>

								<p className="review-body-text">{rev.reviewContent}</p>
							</article>
						);
					})
				)}
			</div>
		</section>
	);
};

export default DestinationReviews;
