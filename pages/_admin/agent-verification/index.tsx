import React, { useState } from 'react';
import { NextPage } from 'next';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AGENT_APPLICATIONS_BY_ADMIN } from '../../../apollo/admin/query';
import { APPROVE_AGENT_APPLICATION, REJECT_AGENT_APPLICATION } from '../../../apollo/admin/mutation';
import { AgentApplicationsInquiry, RejectAgentApplicationInput } from '../../../libs/types/agent/agent.input';
import { Agent } from '../../../libs/types/agent/agent';
import { AgentType, AgentVerificationStatus } from '../../../libs/enums/agent.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../../libs/sweetAlert';
import { DEFAULT_USER_AVATAR, getImageUrl } from '../../../libs/config';
import Pagination from '@mui/material/Pagination';

const AdminAgentVerificationPage: NextPage = () => {
	const [applications, setApplications] = useState<Agent[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
	const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
	const [openMenuId, setOpenMenuId] = useState<string | null>(null);

	const [searchFilter, setSearchFilter] = useState<AgentApplicationsInquiry>({
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: Direction.DESC,
		search: {},
	});

	/** APOLLO REQUESTS **/
	const { loading, refetch } = useQuery(GET_AGENT_APPLICATIONS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: any) => {
			setApplications(data?.getAgentApplications?.list || []);
			setTotal(data?.getAgentApplications?.metaCounter?.[0]?.total || 0);
		},
	});

	const [approveAgentApplication] = useMutation(APPROVE_AGENT_APPLICATION);
	const [rejectAgentApplication] = useMutation(REJECT_AGENT_APPLICATION);

	/** HANDLERS **/


	const handleTypeChange = (type: string) => {
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: {
				...prev.search,
				agentType: type === 'ALL' ? undefined : (type as AgentType),
			},
		}));
	};

	const handleStatusChange = (status: string) => {
		setSearchFilter((prev) => ({
			...prev,
			page: 1,
			search: {
				...prev.search,
				verificationStatus: status === 'ALL' ? undefined : (status as AgentVerificationStatus),
			},
		}));
	};

	const handleReset = () => {
		setSearchFilter({
			page: 1,
			limit: 10,
			sort: 'createdAt',
			direction: Direction.DESC,
			search: {},
		});
	};

	const openDrawer = (agent: Agent) => {
		setSelectedAgent(agent);
		setIsDrawerOpen(true);
		setOpenMenuId(null);
	};

	const closeDrawer = () => {
		setIsDrawerOpen(false);
		setSelectedAgent(null);
	};

	const handleApprove = async (id: string) => {
		if (!confirm('Approve verification for this agent? This grants active marketplace booking capabilities.')) return;
		try {
			await approveAgentApplication({ variables: { input: id } });
			await sweetTopSmallSuccessAlert('Agent approved successfully', 800);
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handleReject = async (id: string) => {
		const reason = prompt('Specify reason for rejecting verification application:');
		if (reason === null) return;
		try {
			const input: RejectAgentApplicationInput = { _id: id, comment: reason || 'Application rejected' };
			await rejectAgentApplication({ variables: { input } });
			await sweetTopSmallSuccessAlert('Agent rejected successfully', 800);
			closeDrawer();
			refetch();
		} catch (err: any) {
			sweetMixinErrorAlert(err.message);
		}
	};

	const handlePaginationChange = (event: any, value: number) => {
		setSearchFilter({ ...searchFilter, page: value });
	};

	return (
		<div className="admin-overview dashboard-container">
			{/* TOP SECTION: HEADER */}
			<div className="overview-header">
				<div className="header-text">
					<h1>Agent Verification</h1>
					<p>Review and verify luxury hotel partners and verified tour expedition operators.</p>
				</div>
				<div className="header-actions">
					<button className="export-btn" type="button">
						<span className="material-symbols-outlined">file_download</span>
						Export Log
					</button>
				</div>
			</div>

			{/* MAIN TABLE SECTION */}
			<section className="admin-table-section">
				{/* TABLE HEADER & FILTERS */}
				<div className="table-header">
					<div className="header-left">
						<h2>Requests</h2>
						<span className="table-badge">{total} Pending Reviews</span>
					</div>
					<div className="header-right" style={{ display: 'flex', gap: '12px' }}>

						
						<div className="filter-select-group">
							<select
								className="filter-select"
								value={searchFilter.search?.agentType || 'ALL'}
								onChange={(e) => handleTypeChange(e.target.value)}
							>
								<option value="ALL">All Types</option>
								<option value={AgentType.HOTEL}>HOTEL</option>
								<option value={AgentType.TOUR}>TOUR</option>
							</select>
						</div>

						<div className="filter-select-group">
							<select
								className="filter-select"
								value={searchFilter.search?.verificationStatus || 'ALL'}
								onChange={(e) => handleStatusChange(e.target.value)}
							>
								<option value="ALL">All Statuses</option>
								<option value={AgentVerificationStatus.PENDING}>Pending</option>
								<option value={AgentVerificationStatus.APPROVED}>Approved</option>
								<option value={AgentVerificationStatus.REJECTED}>Rejected</option>
							</select>
						</div>

						<button
							type="button"
							onClick={handleReset}
							style={{ 
								display: 'flex', 
								alignItems: 'center', 
								gap: '6px', 
								background: 'transparent', 
								border: 'none', 
								color: 'var(--outline)', 
								cursor: 'pointer',
								padding: '0 8px',
								fontSize: '13px',
								fontWeight: 500
							}}
							onMouseOver={(e) => (e.currentTarget.style.color = 'var(--on-surface)')}
							onMouseOut={(e) => (e.currentTarget.style.color = 'var(--outline)')}
						>
							<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
							Reset
						</button>
					</div>
				</div>

				{/* TABLE BODY */}
				<div className="table-container">
					<table>
						<thead>
							<tr>
								<th>Agent</th>
								<th>Company Name</th>
								<th>Type</th>
								<th>Business Number</th>
								<th>Status</th>
								<th>Registered Date</th>
								<th style={{ textAlign: 'right' }}>Actions</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={7} style={{ textAlign: 'center', padding: '32px 0' }}>
										Loading...
									</td>
								</tr>
							) : applications.length === 0 ? (
								<tr>
									<td colSpan={7} style={{ textAlign: 'center', padding: '32px 0', color: 'var(--outline)' }}>
										No agent verification requests found
									</td>
								</tr>
							) : (
								applications.map((agent) => {
									const member = agent.memberData;
									const initials = (member?.memberFullName || member?.memberNick || 'A').substring(0, 2).toUpperCase();

									return (
										<tr key={agent._id}>
											<td>
												<div className="user-avatar-cell" style={{ cursor: 'pointer' }} onClick={() => openDrawer(agent)}>
													{member?.memberImage ? (
														<img
																											src={getImageUrl(member.memberImage, DEFAULT_USER_AVATAR)}
															alt={member?.memberNick}
															style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
														/>
													) : (
														<div
															className="avatar-circle"
															style={{ backgroundColor: 'var(--primary)' }}
														>
															{initials}
														</div>
													)}
													<div className="user-cell">
														<span className="user-name">{member?.memberFullName || member?.memberNick || 'Unknown'}</span>
														<span className="user-email">@{member?.memberNick || 'unknown'}</span>
													</div>
												</div>
											</td>
											<td>
												<span style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{agent.companyName}</span>
											</td>
											<td>
												<span
													className={`badge-pill ${
														agent.agentType === AgentType.HOTEL ? 'indigo' : 'sky'
													}`}
												>
													{agent.agentType}
												</span>
											</td>
											<td>
												<span style={{ color: 'var(--outline)' }}>{agent.businessNumber}</span>
											</td>
											<td>
												<span
													className={`status-pill ${
														agent.verificationStatus === AgentVerificationStatus.APPROVED
															? 'emerald'
															: agent.verificationStatus === AgentVerificationStatus.REJECTED
															? 'cancelled'
															: 'warning'
													}`}
												>
													{agent.verificationStatus}
												</span>
											</td>
											<td>
												<span style={{ color: 'var(--on-surface-variant)' }}>
													{new Date(agent.createdAt).toLocaleDateString()}
												</span>
											</td>
											<td style={{ textAlign: 'right', position: 'relative' }}>
												<div className="actions-group">
													<button
														className="text-btn"
														type="button"
														onClick={() => openDrawer(agent)}
													>
														Review
													</button>
													<button
														className="more-btn"
														type="button"
														onClick={() => setOpenMenuId(openMenuId === agent._id ? null : agent._id)}
													>
														<span className="material-symbols-outlined">more_vert</span>
													</button>
												</div>

												{openMenuId === agent._id && (
													<div
														style={{
															position: 'absolute',
															right: 24,
															top: 40,
															width: 160,
															backgroundColor: '#ffffff',
															borderRadius: 8,
															boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
															padding: '6px 0',
															zIndex: 30,
															textAlign: 'left',
														}}
													>
														<button
															type="button"
															style={{
																width: '100%',
																padding: '8px 12px',
																border: 'none',
																background: 'transparent',
																textAlign: 'left',
																fontSize: 12,
																color: 'var(--on-surface)',
																cursor: 'pointer',
																display: 'flex',
																alignItems: 'center',
																gap: 6,
															}}
															onClick={() => openDrawer(agent)}
														>
															<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
																visibility
															</span>
															View Details
														</button>
														{agent.verificationStatus === AgentVerificationStatus.PENDING && (
															<>
																<button
																	type="button"
																	style={{
																		width: '100%',
																		padding: '8px 12px',
																		border: 'none',
																		background: 'transparent',
																		textAlign: 'left',
																		fontSize: 12,
																		color: '#059669',
																		cursor: 'pointer',
																		display: 'flex',
																		alignItems: 'center',
																		gap: 6,
																	}}
																	onClick={() => handleApprove(agent._id)}
																>
																	<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
																		check_circle
																	</span>
																	Approve
																</button>
																<button
																	type="button"
																	style={{
																		width: '100%',
																		padding: '8px 12px',
																		border: 'none',
																		background: 'transparent',
																		textAlign: 'left',
																		fontSize: 12,
																		color: '#DC2626',
																		cursor: 'pointer',
																		display: 'flex',
																		alignItems: 'center',
																		gap: 6,
																	}}
																	onClick={() => handleReject(agent._id)}
																>
																	<span className="material-symbols-outlined" style={{ fontSize: 16 }}>
																		cancel
																	</span>
																	Reject
																</button>
															</>
														)}
													</div>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
					
					{applications.length > 0 && (
						<div className="table-pagination">
							<Pagination
								count={Math.ceil(total / searchFilter.limit)}
								page={searchFilter.page}
								onChange={handlePaginationChange}
								shape="rounded"
								color="primary"
							/>
						</div>
					)}
				</div>
			</section>

			{/* SLIDE-OUT INSPECTION DRAWER */}
			{isDrawerOpen && selectedAgent && (
				<>
					<div className="admin-drawer-backdrop" onClick={closeDrawer} />
					<aside className="admin-drawer" style={{ width: '400px' }}>
						<div className="drawer-header">
							<div className="header-title">
								<span className="material-symbols-outlined">assignment_ind</span>
								<span>Application Review</span>
							</div>
							<button className="close-btn" type="button" onClick={closeDrawer}>
								<span className="material-symbols-outlined">close</span>
							</button>
						</div>

						<div className="drawer-body" style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
							
							<div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
								<div className="avatar-box" style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>
									{selectedAgent.memberData?.memberImage ? (
																											<img src={getImageUrl(selectedAgent.memberData.memberImage, DEFAULT_USER_AVATAR)} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
									) : (
										(selectedAgent.memberData?.memberFullName || selectedAgent.memberData?.memberNick || 'A').substring(0, 2).toUpperCase()
									)}
								</div>
								<div>
									<h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: 'var(--on-surface)' }}>{selectedAgent.companyName}</h3>
									<span style={{ fontSize: 14, color: 'var(--outline)' }}>@{selectedAgent.memberData?.memberNick}</span>
								</div>
							</div>
							
							<div>
								<h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>Corporate Information</h4>
								<div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span style={{ color: 'var(--outline)', fontSize: 13 }}>Agent Type</span>
										<span style={{ fontWeight: 500, fontSize: 13, color: 'var(--on-surface)' }}>{selectedAgent.agentType}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span style={{ color: 'var(--outline)', fontSize: 13 }}>Business Number</span>
										<span style={{ fontWeight: 500, fontSize: 13, color: 'var(--on-surface)' }}>{selectedAgent.businessNumber}</span>
									</div>
									<div style={{ display: 'flex', justifyContent: 'space-between' }}>
										<span style={{ color: 'var(--outline)', fontSize: 13 }}>Registered On</span>
										<span style={{ fontWeight: 500, fontSize: 13, color: 'var(--on-surface)' }}>{new Date(selectedAgent.createdAt).toLocaleDateString()}</span>
									</div>
								</div>
							</div>
							
							<div>
								<h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>Contact & Address</h4>
								<div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 12 }}>
									<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>mail</span>
										<span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{selectedAgent.memberData?.memberEmail || 'N/A'}</span>
									</div>
									<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
										<span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>call</span>
										<span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{selectedAgent.memberData?.memberPhone || 'N/A'}</span>
									</div>
									<div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
										<span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--outline)' }}>location_on</span>
										<span style={{ fontSize: 13, color: 'var(--on-surface)' }}>{selectedAgent.companyAddress || 'N/A'}</span>
									</div>
								</div>
							</div>
							
							{selectedAgent.companyDesc && (
								<div>
									<h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 8 }}>Company Description</h4>
									<p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
										{selectedAgent.companyDesc}
									</p>
								</div>
							)}

						</div>

						<div className="drawer-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--outline-variant)', display: 'flex', gap: '12px' }}>
							{selectedAgent.verificationStatus === AgentVerificationStatus.PENDING ? (
								<>
									<button
										type="button"
										style={{ flex: 1, padding: '10px', background: 'var(--error-container)', color: '#93000a', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
										onClick={() => handleReject(selectedAgent._id)}
									>
										<span className="material-symbols-outlined" style={{ fontSize: 18 }}>cancel</span>
										Reject
									</button>
									<button
										type="button"
										style={{ flex: 1, padding: '10px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
										onClick={() => handleApprove(selectedAgent._id)}
									>
										<span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
										Approve
									</button>
								</>
							) : (
								<button
									className="btn secondary"
									style={{ width: '100%' }}
									type="button"
									onClick={closeDrawer}
								>
									Close
								</button>
							)}
						</div>
					</aside>
				</>
			)}
		</div>
	);
};

export default withAdminLayout(AdminAgentVerificationPage);
