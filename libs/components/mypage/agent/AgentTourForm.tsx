import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import moment from 'moment';
import { GET_DESTINATIONS } from '../../../../apollo/user/query';
import { CREATE_TOUR, IMAGES_UPLOADER, UPDATE_TOUR } from '../../../../apollo/user/mutation';
import { Tour } from '../../../types/tour/tour';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl } from '../../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';
import { useI18n } from '../../../i18n';

interface AgentTourFormProps {
	tour?: Tour | null;
	onClose: () => void;
	onSaved: () => void;
}

const MAX_IMAGES = 10;
const DESTINATION_INPUT = { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} };
const toDateInput = (value?: Date | string): string => (value ? moment(value).format('YYYY-MM-DD') : '');

/** Create / edit form for an approved TOUR agent; values are sent to createTour / updateTour **/
const AgentTourForm = (props: AgentTourFormProps) => {
	const { t, tError } = useI18n();
	const { tour, onClose, onSaved } = props;
	const isEdit = Boolean(tour?._id);
	const [form, setForm] = useState({
		destinationId: tour?.destinationId ?? '',
		tourName: tour?.tourName ?? '',
		tourDesc: tour?.tourDesc ?? '',
		tourPrice: tour?.tourPrice ? String(tour.tourPrice) : '',
		tourStartDate: toDateInput(tour?.tourStartDate),
		tourEndDate: toDateInput(tour?.tourEndDate),
		tourCapacity: tour?.tourCapacity ? String(tour.tourCapacity) : '10',
		tourDepartureCountry: tour?.tourDepartureCountry ?? '',
		tourDepartureCity: tour?.tourDepartureCity ?? '',
		tourDeparturePlace: tour?.tourDeparturePlace ?? '',
		tourDestinationCity: tour?.tourDestinationCity ?? '',
		tourAdditionalInfo: tour?.tourAdditionalInfo ?? '',
	});
	const [images, setImages] = useState<string[]>(tour?.tourImages ?? []);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const reservedSeats = tour?.tourReservedSeats ?? 0;

	/** APOLLO REQUESTS **/
	const { data: destinationData, loading: destinationsLoading } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: DESTINATION_INPUT },
	});
	const [createTour] = useMutation(CREATE_TOUR);
	const [updateTour] = useMutation(UPDATE_TOUR);
	const [imagesUploader] = useMutation(IMAGES_UPLOADER);

	const destinations: Destination[] = useMemo(
		() => [...(destinationData?.getDestinations?.list ?? [])].sort((a: Destination, b: Destination) => a.destinationName.localeCompare(b.destinationName)),
		[destinationData],
	);

	/** HANDLERS **/
	const updateField = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const value = event.target.value;
		setForm((previous) => ({ ...previous, [field]: value }));
	};

	const destinationChangeHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const destinationId = event.target.value;
		const destination = destinations.find((item) => item._id === destinationId);
		setForm((previous) => ({
			...previous,
			destinationId,
			tourDestinationCity: previous.tourDestinationCity || destination?.destinationName || '',
		}));
	};

	const imageUploadHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES - images.length);
		event.target.value = '';
		if (!files.length) return;
		try {
			setUploading(true);
			const { data } = await imagesUploader({ variables: { files, target: 'tour' } });
			const uploaded: string[] = (data?.imagesUploader ?? []).filter(Boolean);
			if (!uploaded.length) throw new Error(t('common.imageUploadFailed'));
			setImages((previous) => [...previous, ...uploaded].slice(0, MAX_IMAGES));
		} catch (err: any) {
			await sweetMixinErrorAlert(tError(err, 'common.imageUploadFailed'));
		} finally {
			setUploading(false);
		}
	};

	const submitHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		const tourPrice = Number(form.tourPrice);
		const tourCapacity = Math.floor(Number(form.tourCapacity));
		const start = moment(form.tourStartDate, 'YYYY-MM-DD', true);
		const end = moment(form.tourEndDate, 'YYYY-MM-DD', true);

		if (!form.destinationId || !form.tourName.trim()) {
			await sweetMixinErrorAlert(t('agent.tourForm.requiredFields'));
			return;
		}
		if (!Number.isFinite(tourPrice) || tourPrice <= 0) {
			await sweetMixinErrorAlert(t('agent.tourForm.invalidPrice'));
			return;
		}
		if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
			await sweetMixinErrorAlert(t('agent.tourForm.invalidDates'));
			return;
		}
		if (!Number.isInteger(tourCapacity) || tourCapacity < Math.max(1, reservedSeats)) {
			await sweetMixinErrorAlert(t('agent.tourForm.capacityTooLow', { math: Math.max(1, reservedSeats) }));
			return;
		}

		const payload = {
			destinationId: form.destinationId,
			tourName: form.tourName.trim(),
			tourDesc: form.tourDesc.trim(),
			tourPrice: Math.round(tourPrice * 100) / 100,
			tourCurrency: 'USD',
			tourStartDate: start.toISOString(),
			tourEndDate: end.toISOString(),
			tourCapacity,
			tourDepartureCountry: form.tourDepartureCountry.trim(),
			tourDepartureCity: form.tourDepartureCity.trim(),
			tourDeparturePlace: form.tourDeparturePlace.trim(),
			tourDestinationCity: form.tourDestinationCity.trim(),
			tourAdditionalInfo: form.tourAdditionalInfo.trim(),
			tourImages: images,
		};

		try {
			setSubmitting(true);
			if (isEdit && tour) {
				await updateTour({ variables: { input: { _id: tour._id, ...payload } } });
				await sweetTopSmallSuccessAlert(t('agent.tourForm.tourUpdated'), 1200);
			} else {
				await createTour({ variables: { input: payload } });
				await sweetTopSmallSuccessAlert(t('agent.tourForm.tourCreated'), 1200);
			}
			onSaved();
		} catch (err: any) {
			await sweetMixinErrorAlert(tError(err, 'agent.tourForm.saveFailed'));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="agent-listing-modal-overlay" onClick={onClose}>
			<div className="agent-listing-modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
				<div className="modal-header">
					<div className="title-group">
						<span className="material-symbols-outlined icon">hiking</span>
						<h2>{isEdit ? t('agent.tourForm.editTour') : t('agent.addTour')}</h2>
					</div>
					<button type="button" className="close-btn" onClick={onClose} aria-label={t('common.close')}>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<form className="modal-form" onSubmit={submitHandler}>
					<div className="form-row">
						<div className="form-group">
							<label>{t('common.destination')}</label>
							<select className="form-select" value={form.destinationId} onChange={destinationChangeHandler} required>
								<option value="">{destinationsLoading ? t('agent.loadingDestinations') : t('agent.selectDestination')}</option>
								{destinations.map((destination) => (
									<option key={destination._id} value={destination._id}>
										{destination.destinationName}
										{destination.destinationCountry ? `, ${destination.destinationCountry}` : ''}
									</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label>{t('agent.tourForm.destinationCity')}</label>
							<input className="form-input" value={form.tourDestinationCity} onChange={updateField('tourDestinationCity')} />
						</div>
					</div>

					<div className="form-group">
						<label>{t('agent.tourForm.tourName')}</label>
						<input className="form-input" value={form.tourName} onChange={updateField('tourName')} maxLength={200} required />
					</div>

					<div className="form-row four">
						<div className="form-group">
							<label>{t('agent.tourForm.pricePerPersonUsd')}</label>
							<input className="form-input" type="number" min={0.01} step={0.01} value={form.tourPrice} onChange={updateField('tourPrice')} required />
						</div>
						<div className="form-group">
							<label>{t('common.capacity')}</label>
							<input className="form-input" type="number" min={Math.max(1, reservedSeats)} value={form.tourCapacity} onChange={updateField('tourCapacity')} required />
						</div>
						<div className="form-group">
							<label>{t('agent.tourForm.startDate')}</label>
							<input className="form-input" type="date" value={form.tourStartDate} onChange={updateField('tourStartDate')} required />
						</div>
						<div className="form-group">
							<label>{t('agent.tourForm.endDate')}</label>
							<input className="form-input" type="date" min={form.tourStartDate ? moment(form.tourStartDate).add(1, 'day').format('YYYY-MM-DD') : undefined} value={form.tourEndDate} onChange={updateField('tourEndDate')} required />
						</div>
					</div>

					<div className="form-row three">
						<div className="form-group">
							<label>{t('agent.tourForm.departureCountry')}</label>
							<input className="form-input" value={form.tourDepartureCountry} onChange={updateField('tourDepartureCountry')} />
						</div>
						<div className="form-group">
							<label>{t('agent.tourForm.departureCity')}</label>
							<input className="form-input" value={form.tourDepartureCity} onChange={updateField('tourDepartureCity')} />
						</div>
						<div className="form-group">
							<label>{t('agent.tourForm.meetingPoint')}</label>
							<input className="form-input" value={form.tourDeparturePlace} onChange={updateField('tourDeparturePlace')} />
						</div>
					</div>

					<div className="form-group">
						<label>{t('common.description')}</label>
						<textarea className="form-textarea" rows={4} value={form.tourDesc} onChange={updateField('tourDesc')} maxLength={5000} />
					</div>

					<div className="form-group">
						<label>{t('agent.tourForm.additionalInformation')}</label>
						<textarea className="form-textarea" rows={2} value={form.tourAdditionalInfo} onChange={updateField('tourAdditionalInfo')} />
					</div>

					<div className="form-group">
						<label>
							{t('agent.photosCount', { count: images.length, mAXIMAGES: MAX_IMAGES })}
						</label>
						<div className="image-grid">
							{images.map((image) => (
								<div key={image} className="image-thumb">
									<img src={getImageUrl(image)} alt={t('common.tour')} />
									<button type="button" onClick={() => setImages((previous) => previous.filter((item) => item !== image))} aria-label={t('agent.removePhoto')}>
										<span className="material-symbols-outlined">close</span>
									</button>
								</div>
							))}
							{images.length < MAX_IMAGES && (
								<label className={`image-add ${uploading ? 'disabled' : ''}`}>
									<span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'add_photo_alternate'}</span>
									<span>{uploading ? t('agent.uploading') : t('agent.addPhotos')}</span>
									<input type="file" accept="image/jpeg, image/png" multiple hidden disabled={uploading} onChange={imageUploadHandler} />
								</label>
							)}
						</div>
					</div>

					<div className="modal-actions-bar">
						<button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
							{t('common.cancel')}
						</button>
						<button type="submit" className="publish-btn" disabled={submitting || uploading}>
							{submitting ? t('agent.saving') : isEdit ? t('common.saveChanges') : t('agent.tourForm.createTour')}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AgentTourForm;
