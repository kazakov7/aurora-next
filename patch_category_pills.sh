sed -i '' -e '/\.bar-actions {/a\
\
					.category-pills {\
						display: flex;\
						align-items: center;\
						gap: 8px;\
						flex-wrap: wrap;\
\
						.cat-pill-btn {\
							padding: 6px 16px;\
							border-radius: 9999px;\
							font-size: 13px;\
							font-weight: 500;\
							border: none;\
							cursor: pointer;\
							background: #ffffff;\
							color: #141b2b;\
							box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);\
							transition: all 0.15s;\
\
							&.active {\
								background: #293040;\
								color: #ffffff;\
								font-weight: 600;\
							}\
\
							&:hover:not(.active) {\
								background: #e9edff;\
							}\
						}\
					}\
' scss/pc/mypage/myProfile.scss
