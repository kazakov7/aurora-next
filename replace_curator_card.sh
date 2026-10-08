sed -i '' -e '1131,1284c\
        .curator-card {\
          position: relative;\
          height: 380px;\
          border-radius: 24px;\
          overflow: hidden;\
          cursor: pointer;\
          transition: transform 0.3s ease, box-shadow 0.3s ease;\
          display: flex;\
          flex-direction: column;\
          justify-content: space-between;\
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);\
\
          &:hover {\
            transform: translateY(-8px);\
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);\
            \
            .curator-cover-img {\
              transform: scale(1.05);\
            }\
          }\
\
          .curator-cover-img {\
            position: absolute;\
            top: 0;\
            left: 0;\
            width: 100%;\
            height: 100%;\
            object-fit: cover;\
            z-index: 1;\
            transition: transform 0.5s ease;\
          }\
\
          .curator-overlay {\
            position: absolute;\
            bottom: 0;\
            left: 0;\
            width: 100%;\
            height: 60%;\
            background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);\
            z-index: 2;\
          }\
\
          .curator-rank-pill {\
            position: relative;\
            z-index: 3;\
            align-self: flex-start;\
            margin: 20px;\
            padding: 6px 12px;\
            background-color: rgba(0, 0, 0, 0.4);\
            backdrop-filter: blur(8px);\
            border-radius: 9999px;\
            color: #ffffff;\
            font-size: 11px;\
            font-weight: 600;\
            letter-spacing: 0.02em;\
          }\
\
          .curator-bottom-content {\
            position: relative;\
            z-index: 3;\
            padding: 20px;\
            display: flex;\
            align-items: center;\
            justify-content: space-between;\
            gap: 12px;\
\
            .curator-info-row {\
              display: flex;\
              align-items: center;\
              gap: 12px;\
              flex: 1;\
              min-width: 0;\
\
              .curator-small-avatar {\
                width: 38px;\
                height: 38px;\
                border-radius: 50%;\
                border: 2px solid #ffffff;\
                object-fit: cover;\
                flex-shrink: 0;\
              }\
\
              .curator-text-info {\
                display: flex;\
                flex-direction: column;\
                gap: 2px;\
                overflow: hidden;\
\
                .curator-name-wrapper {\
                  display: flex;\
                  align-items: center;\
                  gap: 4px;\
\
                  .curator-name {\
                    margin: 0;\
                    color: #ffffff;\
                    font-size: 15px;\
                    font-weight: 600;\
                    white-space: nowrap;\
                    overflow: hidden;\
                    text-overflow: ellipsis;\
                  }\
\
                  .verified-icon {\
                    color: #7bc2ff;\
                    font-size: 16px;\
                    font-variation-settings: '"'"'FILL'"'"' 1;\
                  }\
                }\
\
                .curator-stats {\
                  color: rgba(255, 255, 255, 0.8);\
                  font-size: 11px;\
                  white-space: nowrap;\
                  overflow: hidden;\
                  text-overflow: ellipsis;\
                }\
              }\
            }\
\
            .curator-follow-wrapper {\
              flex-shrink: 0;\
\
              .explorer-follow-btn {\
                background: #ffffff;\
                color: #141b2b;\
                border: none;\
                padding: 8px 16px;\
                border-radius: 9999px;\
                font-size: 13px;\
                font-weight: 600;\
                cursor: pointer;\
                transition: all 0.2s ease;\
\
                &:hover {\
                  background: #f1f3ff;\
                  transform: scale(1.05);\
                }\
\
                &.following {\
                  background: rgba(255, 255, 255, 0.2);\
                  backdrop-filter: blur(8px);\
                  color: #ffffff;\
                  border: 1px solid rgba(255, 255, 255, 0.4);\
\
                  &:hover {\
                    background: rgba(255, 255, 255, 0.3);\
                  }\
                }\
              }\
            }\
          }\
        }' scss/pc/homepage/homepage.scss
