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
				throw new Error(json.errors?.[0]?.message || 'Upload failed');
			}
		} catch (err: any) {
			console.log('Error, handleImageUpload:', err);
			sweetMixinErrorAlert(err.message || 'Image upload failed');
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
			sweetMixinErrorAlert(Messages.error2);
			return;
		}

		if (!title.trim() || !content.trim()) {
			sweetMixinErrorAlert(Messages.error3);
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
				sweetTopSmallSuccessAlert('Your story has been updated successfully!');
			} else {
				const input: BoardArticleInput = {
					articleCategory: category,
					articleTitle: title.trim(),
					articleContent: content.trim(),
					articleImage: editArticle ? (imageUrl ? imageUrl : "") : (imageUrl || undefined),
				};
				await createBoardArticle({ variables: { input }, refetchQueries: ['GetMember'] });
				sweetTopSmallSuccessAlert('Your story has been dispatched successfully!');
			}

			setTitle('');
			setContent('');
			setImageUrl('');
			onClose();
			onCreated();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || Messages.error1);
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
						<h2>{editArticle ? 'Edit Your Story' : 'Dispatch a New Story'}</h2>
					</div>
					<button
						type="button"
						className="close-btn"
						onClick={onClose}
						aria-label="Close modal"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="modal-form">
					{/* Category selection */}
					<div className="form-group">
						<label>Story Category</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value as BoardArticleCategory)}
							className="form-select"
							disabled={false} // typically category is not edited
						>
							<option value={BoardArticleCategory.TOUR}>Itinerary & Expeditions (TOUR)</option>
							<option value={BoardArticleCategory.HOTEL}>Hotel & Stay Reviews (HOTEL)</option>
							<option value={BoardArticleCategory.DESTINATION}>Photography & Sights (DESTINATION)</option>
							<option value={BoardArticleCategory.GUIDE}>Expedition Logs (GUIDE)</option>
							<option value={BoardArticleCategory.NEWS}>Local Insights (NEWS)</option>
						</select>
					</div>

					{/* Title */}
					<div className="form-group">
						<label>Story Title</label>
						<input
							type="text"
							placeholder="e.g. Solitude at 3,000m: High Alpine Cabins of Zermatt"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="form-input"
							required
						/>
					</div>

					{/* Image Upload */}
					<div className="form-group">
						<label>Cover Photography (Optional)</label>
						{imageUrl ? (
							<div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', border: '1px solid rgba(220, 226, 247, 0.4)' }}>
								<img src={getImageUrl(imageUrl)} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
									accept="image/jpeg, image/png, image/webp"
									onChange={handleImageUpload}
									ref={fileInputRef}
									disabled={uploadingImage}
									className="form-input"
									style={{ padding: '8px 12px' }}
								/>
								{uploadingImage && <span style={{ position: 'absolute', right: '12px', top: '10px', fontSize: '13px', color: '#006194' }}>Uploading...</span>}
							</div>
						)}
					</div>

					{/* Content */}
					<div className="form-group">
						<label>Story Content</label>
						<textarea
							rows={6}
							placeholder="Share the raw details, gear recommendations, hidden trailways, and atmosphere..."
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
							Cancel
						</button>
						<button
							type="submit"
							className="publish-btn"
							disabled={submitting}
						>
							{submitting ? 'Saving...' : (editArticle ? 'Save Changes' : 'Publish Dispatch')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WriteStoryModal;
