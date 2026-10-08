sed -i '' -e '/\.profile-content-area {/a\
\
			.pagination-wrapper {\
				display: flex;\
				align-items: center;\
				justify-content: space-between;\
				margin-top: 32px;\
				padding-top: 24px;\
				border-top: 1px solid #e1e4eb;\
\
				.pagination-info {\
					font-size: 13px;\
					color: #707881;\
				}\
\
				.pagination-pills {\
					display: flex;\
					align-items: center;\
					gap: 6px;\
\
					.nav-arrow-btn {\
						width: 32px;\
						height: 32px;\
						border-radius: 50%;\
						border: none;\
						background: transparent;\
						color: #3f4850;\
						display: flex;\
						align-items: center;\
						justify-content: center;\
						cursor: pointer;\
						transition: background 0.15s;\
\
						&:hover:not(:disabled) {\
							background-color: #f1f3f7;\
						}\
\
						&:disabled {\
							opacity: 0.4;\
							cursor: not-allowed;\
						}\
					}\
\
					.page-num-btn {\
						width: 32px;\
						height: 32px;\
						border-radius: 50%;\
						border: none;\
						background: transparent;\
						font-size: 13px;\
						font-weight: 600;\
						color: #3f4850;\
						display: flex;\
						align-items: center;\
						justify-content: center;\
						cursor: pointer;\
						transition: all 0.15s ease;\
\
						&:hover:not(.active) {\
							background-color: #f1f3f7;\
						}\
\
						&.active {\
							background-color: #141b2b;\
							color: #ffffff;\
						}\
					}\
				}\
			}\
' scss/pc/mypage/myProfile.scss
