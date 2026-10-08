const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scss/pc/mypage/myProfile.scss');
let scssContent = fs.readFileSync(filePath, 'utf-8');

const regex = /\.profile-header-card\s*\{[\s\S]*?(?=\n\t\t\/\* ==========================================================================|\n\t\t\.profile-main-layout\s*\{)/;

const newStyles = `.profile-header-card {
			background: #ffffff;
			border-radius: 12px;
			padding: 24px 32px;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
			border: 1px solid #eef0f4;
			margin-bottom: 28px;
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 24px;

			@media (max-width: 1024px) {
				flex-direction: column;
				align-items: stretch;
				padding: 20px;
			}

			.header-left-bio {
				display: flex;
				align-items: center;
				gap: 16px;
				max-width: 500px;
				min-width: 0;

				.avatar-wrapper {
					position: relative;
					flex-shrink: 0;

					.avatar-img {
						width: 64px;
						height: 64px;
						border-radius: 50%;
						object-fit: cover;
						background-color: #f3f4f6;
					}

					.avatar-check-badge {
						position: absolute;
						bottom: -2px;
						right: -2px;
						width: 18px;
						height: 18px;
						border-radius: 50%;
						background-color: #3b82f6;
						display: flex;
						align-items: center;
						justify-content: center;
						color: #ffffff;
						border: 2px solid #ffffff;

						.material-symbols-outlined {
							font-size: 11px;
							font-weight: 700;
						}
					}
				}

				.bio-details {
					display: flex;
					flex-direction: column;
					gap: 4px;
					min-width: 0;

					.name-row {
						display: flex;
						align-items: center;
						gap: 8px;

						h1 {
							font-size: 18px;
							font-weight: 700;
							color: #111827;
							margin: 0;
						}

						.verified-badge {
							display: inline-flex;
							align-items: center;
							gap: 4px;
							background-color: #eff6ff;
							color: #3b82f6;
							padding: 4px 10px;
							border-radius: 9999px;
							font-size: 11px;
							font-weight: 600;

							.material-symbols-outlined {
								font-size: 13px;
							}
						}
					}

					.meta-row {
						display: flex;
						align-items: center;
						gap: 6px;
						font-size: 12px;
						color: #6b7280;

						.bullet-dot {
							width: 3px;
							height: 3px;
							border-radius: 50%;
							background-color: #9ca3af;
						}

						.location-info {
							display: flex;
							align-items: center;
							gap: 2px;

							.material-symbols-outlined {
								font-size: 14px;
								color: #9ca3af;
							}
						}
					}

					.bio-text {
						font-size: 12px;
						color: #6b7280;
						margin: 0;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}
			}

			.header-center-stats {
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 32px;
				flex-grow: 1;

				@media (max-width: 1024px) {
					justify-content: space-around;
				}

				.stat-item {
					display: flex;
					flex-direction: column;
					align-items: center;
					gap: 2px;
					cursor: pointer;
					background: none;
					border: none;
					padding: 0;

					.stat-number {
						font-size: 18px;
						font-weight: 700;
						color: #111827;
						transition: color 0.15s;
					}

					.stat-label {
						font-size: 12px;
						color: #6b7280;
						transition: color 0.15s;
					}

					&:hover {
						.stat-number,
						.stat-label {
							color: #3b82f6;
						}
					}
				}

				.stat-divider {
					height: 24px;
					width: 1px;
					background-color: #e5e7eb;
				}
			}

			.header-right-actions {
				display: flex;
				align-items: center;
				gap: 12px;

				.edit-profile-btn {
					height: 36px;
					padding: 0 16px;
					background: #f3f4f6;
					border: none;
					color: #374151;
					font-size: 13px;
					font-weight: 600;
					border-radius: 8px;
					display: flex;
					align-items: center;
					gap: 6px;
					cursor: pointer;
					transition: background 0.2s;

					.material-symbols-outlined {
						font-size: 15px;
						color: #4b5563;
					}

					&:hover {
						background: #e5e7eb;
					}
				}

				.settings-icon-btn {
					width: 36px;
					height: 36px;
					background: #f3f4f6;
					border: none;
					color: #374151;
					border-radius: 8px;
					display: flex;
					align-items: center;
					justify-content: center;
					cursor: pointer;
					transition: background 0.2s;

					.material-symbols-outlined {
						font-size: 18px;
						color: #4b5563;
					}

					&:hover {
						background: #e5e7eb;
					}
				}
			}
		}`;

scssContent = scssContent.replace(regex, newStyles);
fs.writeFileSync(filePath, scssContent);
console.log('Done!');
