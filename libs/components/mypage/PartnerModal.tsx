import React, { useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useRouter } from 'next/router';
import { SUBMIT_AGENT_APPLICATION } from '../../../apollo/user/mutation';
import { GET_MY_AGENT_APPLICATIONS } from '../../../apollo/user/query';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { userVar } from '../../../apollo/store';
import { AgentType, AgentVerificationStatus } from '../../enums/agent.enum';

interface PartnerModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
	const user = useReactiveVar(userVar);
	const router = useRouter();
	const [submitAgentApplication, { loading: submitting }] = useMutation(SUBMIT_AGENT_APPLICATION);
	
	const [agentType, setAgentType] = useState<AgentType>(AgentType.HOTEL);
	const [companyName, setCompanyName] = useState('');
	const [businessNumber, setBusinessNumber] = useState('');
	const [companyAddress, setCompanyAddress] = useState('');
	const { data, loading, refetch } = useQuery(GET_MY_AGENT_APPLICATIONS, {
		fetchPolicy: 'network-only',
		variables: { input: { page: 1, limit: 10, search: {} } },
		skip: !isOpen || !user?._id,
	});
	const pendingApplication = data?.getMyAgentApplications?.list?.find(
		(application: { status: AgentVerificationStatus }) => application.status === AgentVerificationStatus.PENDING,
	);

	if (!isOpen) return null;

	const handleSubmit = async () => {
		if (!companyName.trim() || !businessNumber.trim() || !companyAddress.trim()) {
			sweetMixinErrorAlert('Please fill in all required fields.');
			return;
		}

		try {
			await submitAgentApplication({
				variables: {
					input: {
						agentType,
						companyName: companyName.trim(),
						businessNumber: businessNumber.trim(),
						companyAddress: companyAddress.trim(),
					},
				},
			});
			await refetch();
			setCompanyName('');
			setBusinessNumber('');
			setCompanyAddress('');
			sweetTopSmallSuccessAlert('Your application has been submitted successfully!', 2000);
			onClose();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message || 'Failed to submit application.');
		}
	};

	return (
		<div className="partner-modal-overlay">
			<div className="partner-modal-content">
				<div className="modal-header">
					<div className="modal-title-group">
						<h3>Become an AURA Partner</h3>
						<p>Apply to list your hotels or tours on AURA.</p>
					</div>
					<button className="close-btn" onClick={onClose} aria-label="Close modal">
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<div className="modal-body">
					{pendingApplication && <div className="info-alert"><span className="material-symbols-outlined">schedule</span><p>Your partner application is already pending review.</p></div>}
					<fieldset className="partner-type-fieldset">
						<legend>Partner Type</legend>
						<div className="partner-type-grid">
							<label className={`partner-type-card ${agentType === AgentType.HOTEL ? 'selected' : ''}`}>
								<input 
									type="radio" 
									name="partner_type" 
									value={AgentType.HOTEL} 
									checked={agentType === AgentType.HOTEL}
									onChange={() => setAgentType(AgentType.HOTEL)} 
								/>
								<div className="card-info">
									<div className="card-title">
										<span className="material-symbols-outlined">hotel</span>
										<span>Hotel Partner</span>
									</div>
									<p>List boutique stays, alpine chalets, luxury resorts and private villas.</p>
								</div>
							</label>
							<label className={`partner-type-card ${agentType === AgentType.TOUR ? 'selected' : ''}`}>
								<input 
									type="radio" 
									name="partner_type" 
									value={AgentType.TOUR} 
									checked={agentType === AgentType.TOUR}
									onChange={() => setAgentType(AgentType.TOUR)} 
								/>
								<div className="card-info">
									<div className="card-title">
										<span className="material-symbols-outlined">explore</span>
										<span>Tour Partner</span>
									</div>
									<p>Offer guided expeditions, cultural excursions, treks and private charters.</p>
								</div>
							</label>
						</div>
					</fieldset>

					<div className="form-fields">
						<div className="form-group">
							<label>Company Name <span className="required">*</span></label>
							<input 
								type="text" 
								placeholder="e.g. Alpine Horizon Hospitality SA" 
								value={companyName}
								onChange={(e) => setCompanyName(e.target.value)}
							/>
						</div>
						<div className="form-group">
							<label>Business Registration Number <span className="required">*</span></label>
							<input 
								type="text" 
								placeholder="e.g. CHE-109.845.221 or VAT ID" 
								value={businessNumber}
								onChange={(e) => setBusinessNumber(e.target.value)}
							/>
						</div>
						<div className="form-group">
							<label>Company Address <span className="required">*</span></label>
							<input 
								type="text" 
								placeholder="e.g. Bahnhofstrasse 42, 3920 Zermatt, Switzerland" 
								value={companyAddress}
								onChange={(e) => setCompanyAddress(e.target.value)}
							/>
						</div>
					</div>

					<div className="info-alert">
						<span className="material-symbols-outlined">verified_user</span>
						<p>Our administrative team reviews partner applications within 1–2 business days. Once verified, your account will be upgraded with access to the AURA Agent Workspace to manage listings and bookings.</p>
					</div>
				</div>

				<div className="modal-footer">
					<button type="button" className="help-link" onClick={() => router.push('/cs')}>
						<span className="material-symbols-outlined">help</span>
						<span>Need help? Contact partner support</span>
					</button>
					<div className="footer-actions">
						<button className="btn-cancel" onClick={onClose}>Cancel</button>
						<button className="btn-submit" disabled={loading || submitting || Boolean(pendingApplication)} onClick={handleSubmit}>
							<span className="material-symbols-outlined">send</span>
							<span>{submitting ? 'Submitting...' : pendingApplication ? 'Application Pending' : 'Submit Application'}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PartnerModal;
