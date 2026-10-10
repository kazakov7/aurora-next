import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { CREATE_BOARD_ARTICLE, UPDATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { BoardArticleInput, BoardArticleUpdate } from '../../types/board-article/board-article.input';
import { BoardArticle } from '../../types/board-article/board-article';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { getJwtToken } from '../../auth';
import { Messages, getImageUrl } from '../../config';
import { useI18n } from '../../i18n';

interface WriteStoryModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreated: () => void;
	editArticle?: BoardArticle | null;
}

const WriteStoryModal: React.FC<WriteStoryModalProps> = ({
	isOpen,
	onClose,
	onCreated,
	editArticle,
}) => {
	const { t, tError } = useI18n();
	const user = useReactiveVar(userVar);
	const [category, setCategory] = useState<BoardArticleCategory>(BoardArticleCategory.TOUR);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [createBoardArticle] = useMutation(CREATE_BOARD_ARTICLE);
	const [updateBoardArticle] = useMutation(UPDATE_BOARD_ARTICLE);

	useEffect(() => {
		if (isOpen) {
			if (editArticle) {
				setCategory(editArticle.articleCategory);
				setTitle(editArticle.articleTitle);
				setContent(editArticle.articleContent);
				setImageUrl(editArticle.articleImage || '');
			} else {
				setCategory(BoardArticleCategory.TOUR);
				setTitle('');
				setContent('');
				setImageUrl('');
			}
		}
	}, [isOpen, editArticle]);

	if (!isOpen) return null;

	const handleImageUpload = async (e: any) => {
		try {
			const image = e.target.files[0];
			if (!image) return;
			setUploadingImage(true);

			const token = getJwtToken();
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await fetch(process.env.REACT_APP_API_GRAPHQL_URL || 'http://localhost:3007/graphql', {
				method: 'POST',
				headers: {
					'apollo-require-preflight': 'true',
					Authorization: `Bearer ${token}`,
				},
				body: formData,
			});

			const json = await response.json();
			const responseImage = json.data?.imageUploader;
			if (responseImage) {
				setImageUrl(responseImage);
			} else {
				throw new Error(json.errors?.[0]?.message || t('common.uploadFailed'));
			}
		} catch (err: any) {
			console.log('Error, handleImageUpload:', err);
			sweetMixinErrorAlert(tError(err, 'common.imageUploadFailed'));
		} finally {
			setUploadingImage(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = '';
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?._id) {
			sweetMixinErrorAlert(t(Messages.error2));
			return;
		}

		if (!title.trim() || !content.trim()) {
			sweetMixinErrorAlert(t(Messages.error3));
			return;
		}

		try {
			setSubmitting(true);
			
			if (editArticle) {
				const updateInput: BoardArticleUpdate = {
					_id: editArticle._id,
					articleCategory: category,

					articleTitle: title.trim(),
					articleContent: content.trim(),
					articleImage: editArticle ? (imageUrl ? imageUrl : "") : (imageUrl || undefined),
					articleStatus: BoardArticleStatus.PUBLISHED,
				};
				await updateBoardArticle({ variables: { input: updateInput }, refetchQueries: ['GetMember'] });
				sweetTopSmallSuccessAlert(t('community.writeStory.updated'));
			} else {
				const input: BoardArticleInput = {
					articleCategory: category,
					articleTitle: title.trim(),
					articleContent: content.trim(),
					articleImage: editArticle ? (imageUrl ? imageUrl : "") : (imageUrl || undefined),
				};
				await createBoardArticle({ variables: { input }, refetchQueries: ['GetMember'] });
				sweetTopSmallSuccessAlert(t('community.writeStory.published'));
			}

			setTitle('');
			setContent('');
			setImageUrl('');
			onClose();
			onCreated();
		} catch (err: any) {
			sweetMixinErrorAlert(tError(err, Messages.error1));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="write-story-modal-overlay" onClick={onClose}>
			<div
				className="write-story-modal-card"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="modal-header">
					<div className="title-group">
						<span className="material-symbols-outlined icon">edit_note</span>
						<h2>{editArticle ? t('community.writeStory.editYourStory') : t('community.writeStory.dispatchANewStory')}</h2>
					</div>
					<button
						type="button"
						className="close-btn"
						onClick={onClose}
						aria-label={t('community.writeStory.closeModal')}
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-form">
					{/* Category selection */}
					<div className="form-group">
						<label>{t('community.writeStory.storyCategory')}</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value as BoardArticleCategory)}
							className="form-select"
							disabled={false} // typically category is not edited
						>
							<option value={BoardArticleCategory.TOUR}>{t('community.writeStory.categoryTour')}</option>
							<option value={BoardArticleCategory.HOTEL}>{t('community.writeStory.categoryHotel')}</option>
							<option value={BoardArticleCategory.DESTINATION}>{t('community.writeStory.categoryDestination')}</option>
							<option value={BoardArticleCategory.GUIDE}>{t('community.writeStory.categoryGuide')}</option>
							<option value={BoardArticleCategory.NEWS}>{t('community.writeStory.categoryNews')}</option>
						</select>
					</div>

					{/* Title */}
					<div className="form-group">
						<label>{t('community.writeStory.storyTitle')}</label>
						<input
							type="text"
							placeholder={t('community.writeStory.titlePlaceholder')}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="form-input"
							required
						/>
					</div>

					{/* Image Upload */}
					<div className="form-group">
						<label>{t('community.writeStory.coverPhotographyOptional')}</label>
						{imageUrl ? (
							<div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', border: '1px solid rgba(220, 226, 247, 0.4)' }}>
								<img src={getImageUrl(imageUrl)} alt={t('community.writeStory.coverPreview')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
								<button 
									type="button" 
									onClick={() => setImageUrl('')}
									style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
								>
									<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
								</button>
							</div>
						) : (
							<div style={{ position: 'relative' }}>
								<input
									type="file"
									accept="image/jpeg, image/png"
									onChange={handleImageUpload}
									ref={fileInputRef}
									disabled={uploadingImage}
									className="form-input"
									style={{ padding: '8px 12px' }}
								/>
								{uploadingImage && <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: '#006194' }}>{t('community.writeStory.uploading')}</span>}
							</div>
						)}
					</div>

					{/* Content */}
					<div className="form-group">
						<label>{t('community.writeStory.storyContent')}</label>
						<textarea
							rows={6}
							placeholder={t('community.writeStory.contentPlaceholder')}
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="form-textarea"
							required
						/>
					</div>

					{/* Actions */}
					<div className="modal-actions-bar">
						<button
							type="button"
							className="cancel-btn"
							onClick={onClose}
							disabled={submitting}
						>
							{t('common.cancel')}
						</button>
						<button
							type="submit"
							className="publish-btn"
							disabled={submitting}
						>
							{submitting ? t('community.writeStory.saving') : (editArticle ? t('common.saveChanges') : t('community.writeStory.publishDispatch'))}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WriteStoryModal;
