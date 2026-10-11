import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '../../../apollo/store';
import { CREATE_SUPPORT_TICKET } from '../../../apollo/user/mutation';
import { getJwtToken } from '../../auth';
import { SupportCategory } from '../../enums/support.enum';
import { SupportTicketInput } from '../../types/support/support.input';
import { SupportTicket } from '../../types/support/support';
import { sweetMixinErrorAlert } from '../../sweetAlert';
import { useI18n } from '../../i18n';
import { REACT_APP_API_GRAPHQL_URL } from '../../config';

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = ['image/png', 'image/jpg', 'image/jpeg'];

const CATEGORY_OPTIONS: { value: SupportCategory; labelKey: string }[] = [
	{ value: SupportCategory.BOOKING, labelKey: 'support.booking' },
	{ value: SupportCategory.PROPERTY, labelKey: 'support.property' },
	{ value: SupportCategory.TOUR, labelKey: 'support.tour' },
	{ value: SupportCategory.ACCOUNT, labelKey: 'support.account' },
	{ value: SupportCategory.TECHNICAL, labelKey: 'support.technical' },
	{ value: SupportCategory.OTHER, labelKey: 'support.other' },
];

const emptyInput: SupportTicketInput = {
	ticketCategory: SupportCategory.BOOKING,
	ticketName: '',
	ticketEmail: '',
	ticketSubject: '',
	ticketMessage: '',
};

const CsContactForm = () => {
	const { t, tError } = useI18n();
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [input, setInput] = useState<SupportTicketInput>(emptyInput);
	const [fileName, setFileName] = useState<string>('');
	const [uploading, setUploading] = useState<boolean>(false);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

	/** APOLLO REQUESTS **/
	const [createSupportTicket] = useMutation(CREATE_SUPPORT_TICKET);

	/** LIFECYCLES **/
	useEffect(() => {
		if (!user?._id) return;
		setInput((prev) => ({
			...prev,
			ticketName: prev.ticketName || user.memberFullName || user.memberNick || '',
			ticketEmail: prev.ticketEmail || user.memberEmail || '',
		}));
	}, [user?._id]);

	/** HANDLERS **/
	const handleChange = (field: keyof SupportTicketInput, value: string) => {
		setInput((prev) => ({ ...prev, [field]: value }));
	};

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
			sweetMixinErrorAlert(t('support.form.invalidFileType'));
			e.target.value = '';
			return;
		}
		if (file.size > MAX_ATTACHMENT_SIZE) {
			sweetMixinErrorAlert(t('support.form.fileTooLarge'));
			e.target.value = '';
			return;
		}

		try {
			setUploading(true);
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target)
					}`,
					variables: { file: null, target: 'support' },
				}),
			);
			formData.append('map', JSON.stringify({ '0': ['variables.file'] }));
			formData.append('0', file);

			const response = await fetch(REACT_APP_API_GRAPHQL_URL, {
				method: 'POST',
				headers: {
					'Apollo-Require-Preflight': 'true',
					Authorization: `Bearer ${getJwtToken()}`,
				},
				body: formData,
			});
			const json = await response.json();
			const uploadedPath = json.data?.imageUploader;
			if (!uploadedPath) throw new Error(json.errors?.[0]?.message || t('common.uploadFailed'));

			setInput((prev) => ({ ...prev, ticketAttachment: uploadedPath }));
			setFileName(t('support.form.attached', { name: file.name, size: (file.size / 1024 / 1024).toFixed(2) }));
		} catch (err: any) {
			console.log('Error, handleFileSelect:', err);
			sweetMixinErrorAlert(tError(err, 'support.form.attachmentUploadFailed'));
			if (fileInputRef.current) fileInputRef.current.value = '';
		} finally {
			setUploading(false);
		}
	};

	const handleRemoveAttachment = (e: React.MouseEvent) => {
		e.stopPropagation();
		setInput((prev) => ({ ...prev, ticketAttachment: undefined }));
		setFileName('');
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user?._id) {
			router.push('/account/login');
			return;
		}
		if (input.ticketMessage.trim().length < 10) {
			sweetMixinErrorAlert(t('support.form.messageTooShort'));
			return;
		}

		try {
			setSubmitting(true);
			const { data } = await createSupportTicket({
				variables: {
					input: {
						...input,
						ticketName: input.ticketName.trim(),
						ticketEmail: input.ticketEmail.trim(),
						ticketSubject: input.ticketSubject.trim(),
						ticketMessage: input.ticketMessage.trim(),
					},
				},
			});
			setCreatedTicket(data?.createSupportTicket ?? null);
		} catch (err: any) {
			console.log('Error, handleSubmit:', err);
			sweetMixinErrorAlert(tError(err));
		} finally {
			setSubmitting(false);
		}
	};

	const handleReset = () => {
		setCreatedTicket(null);
		setFileName('');
		setInput({
			...emptyInput,
			ticketName: user.memberFullName || user.memberNick || '',
			ticketEmail: user.memberEmail || '',
		});
		if (fileInputRef.current) fileInputRef.current.value = '';
	};

	if (!user?._id) {
		return (
			<div className="form-panel">
				<div className="success-banner login-required">
					<div className="icon-wrapper">
						<span className="material-symbols-outlined">lock</span>
					</div>
					<div className="text-wrapper">
						<h4>{t('support.signInRequired')}</h4>
						<p>{t('support.signInDescription')}</p>
					</div>
					<button className="submit-another-btn" type="button" onClick={() => router.push('/account/login')}>
						{t('auth.login')}
					</button>
				</div>
			</div>
		);
	}

	if (createdTicket) {
		return (
			<div className="form-panel">
				<div className="success-banner">
					<div className="icon-wrapper">
						<span className="material-symbols-outlined">task_alt</span>
					</div>
					<div className="text-wrapper">
						<h4>{t('support.ticketSubmitted', { id: createdTicket._id.slice(-8).toUpperCase() })}</h4>
						<p>{t('support.ticketSuccess')}</p>
					</div>
					<button className="submit-another-btn" type="button" onClick={handleReset}>
						{t('support.submitAnother')}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="form-panel">
			<form onSubmit={handleSubmit} className="support-form">
				<div className="form-row">
					<div className="form-group">
						<label>{t('support.fullName')}</label>
						<input
							type="text"
							placeholder={t('support.form.namePlaceholder')}
							value={input.ticketName}
							onChange={(e) => handleChange('ticketName', e.target.value)}
							minLength={2}
							maxLength={100}
							required
						/>
					</div>
					<div className="form-group">
						<label>{t('support.email')}</label>
						<input
							type="email"
							placeholder={t('support.form.emailPlaceholder')}
							value={input.ticketEmail}
							onChange={(e) => handleChange('ticketEmail', e.target.value)}
							required
						/>
					</div>
				</div>
				<div className="form-row">
					<div className="form-group">
						<label>{t('support.category')}</label>
						<select value={input.ticketCategory} onChange={(e) => handleChange('ticketCategory', e.target.value)} required>
							{CATEGORY_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{t(option.labelKey)}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>{t('support.subject')}</label>
						<input
							type="text"
							placeholder={t('support.subjectPlaceholder')}
							value={input.ticketSubject}
							onChange={(e) => handleChange('ticketSubject', e.target.value)}
							minLength={3}
							maxLength={200}
							required
						/>
					</div>
				</div>
				<div className="form-group">
					<label>{t('support.message')}</label>
					<textarea
						rows={5}
						placeholder={t('support.messagePlaceholder')}
						value={input.ticketMessage}
						onChange={(e) => handleChange('ticketMessage', e.target.value)}
						minLength={10}
						maxLength={5000}
						required
					></textarea>
				</div>
				<div className="form-group">
					<label>{t('support.attachment')}</label>
					<div className="drop-zone" onClick={() => !uploading && fileInputRef.current?.click()}>
						<span className="material-symbols-outlined">{uploading ? 'sync' : 'attach_file'}</span>
						<div className="drop-text">
							<p className={fileName ? 'has-file' : ''}>
								{uploading ? t('support.uploading') : fileName || t('support.attachmentHint')}
							</p>
							<p className="subtitle">{t('support.supportedFiles')}</p>
						</div>
						{fileName && !uploading && (
							<span className="material-symbols-outlined remove-attachment" onClick={handleRemoveAttachment}>
								close
							</span>
						)}
						<input type="file" hidden ref={fileInputRef} accept=".png,.jpg,.jpeg" onChange={handleFileSelect} />
					</div>
				</div>

				<div className="form-actions">
					<p className="secure-text">{t('support.linkedAccount', { nickname: user.memberNick ?? '' })}</p>
					<button type="submit" className="submit-btn" disabled={submitting || uploading}>
						{submitting ? (
							<>
								<span className="material-symbols-outlined spin">sync</span>
								<span>{t('support.sending')}</span>
							</>
						) : (
							<>
								<span>{t('support.submit')}</span>
								<span className="material-symbols-outlined">arrow_forward</span>
							</>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CsContactForm;
