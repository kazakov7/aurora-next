import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_DESTINATIONS } from '../../../../apollo/user/query';
import { CREATE_PROPERTY, IMAGES_UPLOADER, UPDATE_PROPERTY } from '../../../../apollo/user/mutation';
import { PropertyType } from '../../../enums/property.enum';
import { Property } from '../../../types/property/property';
import { CreatePropertyInput } from '../../../types/property/property.input';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl, PROPERTY_AMENITY_OPTIONS } from '../../../config';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../sweetAlert';

interface AgentPropertyFormProps {
	property?: Property | null;
	onClose: () => void;
	onSaved: () => void;
}

const MAX_IMAGES = 10;
const DESTINATION_INPUT = { page: 1, limit: 100, sort: 'createdAt', direction: 'DESC', search: {} };

const toInt = (value: string): number => (value === '' ? 0 : Math.max(0, Math.floor(Number(value))));

/** Create / edit form for an approved HOTEL agent; all values are sent to createProperty / updateProperty **/
const AgentPropertyForm = (props: AgentPropertyFormProps) => {
	const { property, onClose, onSaved } = props;
	const isEdit = Boolean(property?._id);
	const [form, setForm] = useState({
		destinationId: property?.destinationId ?? '',
		propertyType: property?.propertyType ?? PropertyType.HOTEL,
		propertyName: property?.propertyName ?? '',
		propertyDesc: property?.propertyDesc ?? '',
		propertyCity: property?.propertyCity ?? '',
		propertyAddress: property?.propertyAddress ?? '',
		pricePerNight: property?.pricePerNight ? String(property.pricePerNight) : '',
		maxGuests: property?.maxGuests ? String(property.maxGuests) : '2',
		bedrooms: String(property?.bedrooms ?? 1),
		beds: String(property?.beds ?? 1),
		bathrooms: String(property?.bathrooms ?? 1),
	});
	const [amenities, setAmenities] = useState<string[]>(property?.amenities ?? []);
	const [images, setImages] = useState<string[]>(property?.propertyImages ?? []);
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	/** APOLLO REQUESTS **/
	const { data: destinationData, loading: destinationsLoading } = useQuery(GET_DESTINATIONS, {
		fetchPolicy: 'cache-and-network',
		variables: { input: DESTINATION_INPUT },
	});
	const [createProperty] = useMutation(CREATE_PROPERTY);
	const [updateProperty] = useMutation(UPDATE_PROPERTY);
	const [imagesUploader] = useMutation(IMAGES_UPLOADER);

	const destinations: Destination[] = useMemo(
		() => [...(destinationData?.getDestinations?.list ?? [])].sort((a: Destination, b: Destination) => a.destinationName.localeCompare(b.destinationName)),
		[destinationData],
	);
	// Keep stored values that are outside the canonical list selectable while editing
	const amenityOptions = useMemo(
		() => Array.from(new Set([...PROPERTY_AMENITY_OPTIONS, ...(property?.amenities ?? [])])),
		[property?.amenities],
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
			// Prefill the city from the chosen destination when the agent has not typed one
			propertyCity: previous.propertyCity || destination?.destinationName || '',
		}));
	};

	const toggleAmenity = (amenity: string) => {
		setAmenities((previous) => (previous.includes(amenity) ? previous.filter((item) => item !== amenity) : [...previous, amenity]));
	};

	const imageUploadHandler = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(event.target.files ?? []).slice(0, MAX_IMAGES - images.length);
		event.target.value = '';
		if (!files.length) return;
		try {
			setUploading(true);
			const { data } = await imagesUploader({ variables: { files, target: 'property' } });
			const uploaded: string[] = (data?.imagesUploader ?? []).filter(Boolean);
			if (!uploaded.length) throw new Error('Image upload failed');
			setImages((previous) => [...previous, ...uploaded].slice(0, MAX_IMAGES));
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Image upload failed');
		} finally {
			setUploading(false);
		}
	};

	const submitHandler = async (event: React.FormEvent) => {
		event.preventDefault();
		const pricePerNight = Number(form.pricePerNight);
		const maxGuests = toInt(form.maxGuests);
		if (!form.destinationId || !form.propertyName.trim() || !form.propertyAddress.trim()) {
			await sweetMixinErrorAlert('Destination, name and address are required.');
			return;
		}
		if (!Number.isFinite(pricePerNight) || pricePerNight <= 0 || maxGuests < 1) {
			await sweetMixinErrorAlert('Enter a valid nightly rate and at least 1 guest.');
			return;
		}

		const payload: CreatePropertyInput = {
			destinationId: form.destinationId,
			propertyType: form.propertyType as PropertyType,
			propertyName: form.propertyName.trim(),
			propertyDesc: form.propertyDesc.trim(),
			propertyCity: form.propertyCity.trim(),
			propertyAddress: form.propertyAddress.trim(),
			pricePerNight: Math.round(pricePerNight * 100) / 100,
			currency: 'USD',
			maxGuests,
			bedrooms: toInt(form.bedrooms),
			beds: toInt(form.beds),
			bathrooms: toInt(form.bathrooms),
			amenities,
			propertyImages: images,
		};

		try {
			setSubmitting(true);
			if (isEdit && property) {
				// UpdatePropertyInput has no destinationId: the destination is fixed after creation
				const { destinationId, ...updatable } = payload;
				await updateProperty({ variables: { input: { _id: property._id, ...updatable } } });
				await sweetTopSmallSuccessAlert('Property updated', 1200);
			} else {
				await createProperty({ variables: { input: payload } });
				await sweetTopSmallSuccessAlert('Property submitted', 1200);
			}
			onSaved();
		} catch (err: any) {
			await sweetMixinErrorAlert(err?.message || 'Could not save the property.');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="agent-listing-modal-overlay" onClick={onClose}>
			<div className="agent-listing-modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
				<div className="modal-header">
					<div className="title-group">
						<span className="material-symbols-outlined icon">apartment</span>
						<h2>{isEdit ? 'Edit Hotel' : 'Add Hotel'}</h2>
					</div>
					<button type="button" className="close-btn" onClick={onClose} aria-label="Close">
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<form className="modal-form" onSubmit={submitHandler}>
					<div className="form-row">
						<div className="form-group">
							<label>Destination</label>
							<select className="form-select" value={form.destinationId} onChange={destinationChangeHandler} disabled={isEdit} required>
								<option value="">{destinationsLoading ? 'Loading destinations…' : 'Select destination'}</option>
								{destinations.map((destination) => (
									<option key={destination._id} value={destination._id}>
										{destination.destinationName}
										{destination.destinationCountry ? `, ${destination.destinationCountry}` : ''}
									</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label>Property Type</label>
							<select className="form-select" value={form.propertyType} onChange={updateField('propertyType')}>
								{Object.values(PropertyType).map((type) => (
									<option key={type} value={type}>
										{type.charAt(0) + type.slice(1).toLowerCase()}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="form-group">
						<label>Property Name</label>
						<input className="form-input" value={form.propertyName} onChange={updateField('propertyName')} maxLength={200} required />
					</div>

					<div className="form-row">
						<div className="form-group">
							<label>City</label>
							<input className="form-input" value={form.propertyCity} onChange={updateField('propertyCity')} />
						</div>
						<div className="form-group">
							<label>Address</label>
							<input className="form-input" value={form.propertyAddress} onChange={updateField('propertyAddress')} required />
						</div>
					</div>

					<div className="form-row four">
						<div className="form-group">
							<label>Nightly Rate ($)</label>
							<input className="form-input" type="number" min={0.01} step={0.01} value={form.pricePerNight} onChange={updateField('pricePerNight')} required />
						</div>
						<div className="form-group">
							<label>Max Guests</label>
							<input className="form-input" type="number" min={1} value={form.maxGuests} onChange={updateField('maxGuests')} required />
						</div>
						<div className="form-group">
							<label>Bedrooms</label>
							<input className="form-input" type="number" min={0} value={form.bedrooms} onChange={updateField('bedrooms')} />
						</div>
						<div className="form-group">
							<label>Beds / Baths</label>
							<div className="inline-pair">
								<input className="form-input" type="number" min={0} value={form.beds} onChange={updateField('beds')} aria-label="Beds" />
								<input className="form-input" type="number" min={0} value={form.bathrooms} onChange={updateField('bathrooms')} aria-label="Bathrooms" />
							</div>
						</div>
					</div>

					<div className="form-group">
						<label>Description</label>
						<textarea className="form-textarea" rows={4} value={form.propertyDesc} onChange={updateField('propertyDesc')} maxLength={3000} />
					</div>

					<div className="form-group">
						<label>Amenities</label>
						<div className="chip-grid">
							{amenityOptions.map((amenity) => (
								<button
									key={amenity}
									type="button"
									className={`chip ${amenities.includes(amenity) ? 'active' : ''}`}
									onClick={() => toggleAmenity(amenity)}
								>
									{amenity}
								</button>
							))}
						</div>
					</div>

					<div className="form-group">
						<label>
							Photos ({images.length}/{MAX_IMAGES})
						</label>
						<div className="image-grid">
							{images.map((image) => (
								<div key={image} className="image-thumb">
									<img src={getImageUrl(image)} alt="Property" />
									<button type="button" onClick={() => setImages((previous) => previous.filter((item) => item !== image))} aria-label="Remove photo">
										<span className="material-symbols-outlined">close</span>
									</button>
								</div>
							))}
							{images.length < MAX_IMAGES && (
								<label className={`image-add ${uploading ? 'disabled' : ''}`}>
									<span className="material-symbols-outlined">{uploading ? 'hourglass_top' : 'add_photo_alternate'}</span>
									<span>{uploading ? 'Uploading…' : 'Add photos'}</span>
									<input type="file" accept="image/jpeg, image/png" multiple hidden disabled={uploading} onChange={imageUploadHandler} />
								</label>
							)}
						</div>
					</div>

					<div className="modal-actions-bar">
						<button type="button" className="cancel-btn" onClick={onClose} disabled={submitting}>
							Cancel
						</button>
						<button type="submit" className="publish-btn" disabled={submitting || uploading}>
							{submitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Submit Hotel'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AgentPropertyForm;
