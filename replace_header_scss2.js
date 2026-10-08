const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scss/pc/mypage/myProfile.scss');
let scssContent = fs.readFileSync(filePath, 'utf-8');

const regex = /\.profile-header-card\s*\{[\s\S]*?(?=\n\t\t\/\* ==========================================================================|\n\t\t\.profile-main-layout\s*\{)/;

const newStyles = `.profile-header-card {
			background: #ffffff;
			border-radius: 16px;
			border: 1px solid rgba(226, 232, 240, 0.8);
			box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03);
			padding: 24px;
			margin-bottom: 32px;
			transition: all 0.3s;

			&:hover {
				box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
			}

			.header-content-wrapper {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				gap: 24px;

				@media (min-width: 1024px) {
					flex-direction: row;
					align-items: center;
				}
			}

			.header-left-bio {
				display: flex;
				align-items: flex-start;
				gap: 20px;
				flex: 1;
				min-width: 0;

				@media (min-width: 768px) {
					align-items: center;
					gap: 24px;
				}

				.avatar-wrapper {
					position: relative;
					flex-shrink: 0;

					.avatar-circle {
						width: 80px;
						height: 80px;
						border-radius: 50%;
						background-color: #f1f5f9;
						box-shadow: 0 0 0 4px #f8fafc;
						overflow: hidden;

						@media (min-width: 768px) {
							width: 96px;
							height: 96px;
						}

						.avatar-img {
							width: 100%;
							height: 100%;
							object-fit: cover;
						}
					}

					.verified-badge-icon {
						position: absolute;
						bottom: -4px;
						right: -4px;
						background-color: #0284c7;
						color: #ffffff;
						padding: 4px;
						border-radius: 50%;
						box-shadow: 0 0 0 2px #ffffff;
						display: flex;
						align-items: center;
						justify-content: center;

						svg {
							width: 14px;
							height: 14px;
						}
					}
				}

				.bio-details {
					flex: 1;
					min-width: 0;

					.name-row {
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						gap: 10px;
						margin-bottom: 6px;

						h1 {
							font-family: 'Plus Jakarta Sans', sans-serif;
							font-size: 20px;
							font-weight: 700;
							color: #0f172a;
							letter-spacing: -0.025em;
							margin: 0;

							@media (min-width: 768px) {
								font-size: 24px;
							}
						}

						.verified-pill {
							display: inline-flex;
							align-items: center;
							gap: 6px;
							padding: 2px 10px;
							border-radius: 9999px;
							font-size: 12px;
							font-weight: 600;
							background-color: #f0f9ff;
							color: #0369a1;
							border: 1px solid rgba(186, 230, 253, 0.6);

							svg {
								width: 14px;
								height: 14px;
								color: #0284c7;
							}
						}

						.top-contributor-pill {
							display: inline-flex;
							align-items: center;
							padding: 2px 8px;
							border-radius: 9999px;
							font-size: 11px;
							font-weight: 500;
							background-color: #f1f5f9;
							color: #475569;
						}
					}

					.meta-row {
						display: flex;
						flex-wrap: wrap;
						align-items: center;
						gap: 12px;
						row-gap: 4px;
						font-size: 12px;
						color: #64748b;

						@media (min-width: 768px) {
							font-size: 14px;
						}

						.handle {
							font-weight: 500;
							color: #334155;
						}

						.dot {
							color: #cbd5e1;
						}

						.location {
							display: inline-flex;
							align-items: center;
							gap: 4px;

							svg {
								width: 14px;
								height: 14px;
								color: #94a3b8;
							}
						}
					}
				}
			}

			.header-right-section {
				display: flex;
				flex-wrap: wrap;
				align-items: center;
				justify-content: space-between;
				gap: 24px;
				padding-top: 16px;
				border-top: 1px solid #f1f5f9;

				@media (min-width: 1024px) {
					justify-content: flex-end;
					padding-top: 0;
					border-top: none;
				}

				.key-metrics {
					display: flex;
					align-items: center;
					gap: 24px;
					padding: 0 8px;
					border-right: none;

					@media (min-width: 640px) {
						gap: 32px;
					}

					@media (min-width: 1024px) {
						padding: 0 24px;
						border-right: 1px solid rgba(226, 232, 240, 0.8);
					}

					.metric-item {
						text-align: center;
						cursor: pointer;

						@media (min-width: 640px) {
							text-align: left;
						}

						&:hover {
							.metric-number {
								color: #0284c7;
							}
						}

						.metric-number {
							font-family: 'Plus Jakarta Sans', sans-serif;
							font-size: 18px;
							font-weight: 700;
							color: #0f172a;
							transition: color 0.2s;

							@media (min-width: 768px) {
								font-size: 20px;
							}
						}

						.metric-label {
							font-size: 11px;
							text-transform: uppercase;
							letter-spacing: 0.05em;
							font-weight: 600;
							color: #94a3b8;
						}
					}

					.metric-divider {
						width: 1px;
						height: 32px;
						background-color: #e2e8f0;
					}
				}

				.action-buttons {
					display: flex;
					align-items: center;
					gap: 10px;

					button {
						display: inline-flex;
						align-items: center;
						justify-content: center;
						gap: 6px;
						height: 36px;
						border-radius: 9999px;
						font-size: 12px;
						font-weight: 600;
						cursor: pointer;
						transition: all 0.2s;
						box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

						&:active {
							transform: scale(0.95);
						}

						.material-symbols-outlined {
							font-size: 16px;
						}
					}

					.btn-primary {
						padding: 0 20px;
						background-color: #0284c7;
						color: #ffffff;
						border: none;

						&:hover {
							background-color: #0369a1;
						}

						.material-symbols-outlined {
							font-size: 16px;
						}
					}

					.btn-secondary {
						padding: 0 16px;
						background-color: #ffffff;
						color: #334155;
						border: 1px solid #e2e8f0;

						&:hover {
							background-color: #f8fafc;
						}
					}
				}
			}
		}`;

scssContent = scssContent.replace(regex, newStyles);
fs.writeFileSync(filePath, scssContent);
console.log('Done replacement!');
