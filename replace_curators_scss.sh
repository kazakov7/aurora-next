sed -i '' -e '1072,1242c\
  .curators-section {\
    width: 100%;\
    padding: 100px 0;\
    background: #ffffff;\
\
    .section-container {\
      width: 100%;\
      max-width: $container-width;\
      margin: 0 auto;\
      padding: 0 24px;\
\
      .team-header {\
        text-align: center;\
        margin-bottom: 60px;\
        display: flex;\
        flex-direction: column;\
        align-items: center;\
\
        .team-badge {\
          font-size: 14px;\
          font-weight: 600;\
          color: #141b2b;\
          border: 1px solid #e1e8fd;\
          border-radius: 8px;\
          padding: 6px 16px;\
          margin-bottom: 24px;\
          display: inline-block;\
        }\
\
        .team-title {\
          font-size: 48px;\
          line-height: 1.1;\
          font-weight: 600;\
          letter-spacing: -0.03em;\
          color: #141b2b;\
          margin: 0;\
        }\
      }\
\
      .team-grid {\
        display: grid;\
        grid-template-columns: repeat(4, 1fr);\
        gap: 32px;\
\
        .team-card {\
          display: flex;\
          flex-direction: column;\
          align-items: center;\
          text-align: center;\
          cursor: pointer;\
          transition: transform 0.3s ease;\
\
          &:hover {\
            transform: translateY(-8px);\
          }\
\
          .team-avatar-wrap {\
            width: 100%;\
            aspect-ratio: 4 / 5;\
            position: relative;\
            margin-bottom: 24px;\
            overflow: hidden;\
            mask-size: 100% 100%;\
            mask-repeat: no-repeat;\
            mask-position: center;\
            -webkit-mask-size: 100% 100%;\
            -webkit-mask-repeat: no-repeat;\
            -webkit-mask-position: center;\
\
            .team-cover-img {\
              width: 100%;\
              height: 100%;\
              object-fit: cover;\
            }\
          }\
\
          &[data-shape="0"] .team-avatar-wrap {\
            background-color: #3f24ff;\
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Crect x='"'"'0'"'"' y='"'"'0'"'"' width='"'"'200'"'"' height='"'"'140'"'"' rx='"'"'60'"'"'/%3E%3Crect x='"'"'0'"'"' y='"'"'100'"'"' width='"'"'200'"'"' height='"'"'140'"'"' rx='"'"'60'"'"'/%3E%3C/svg%3E");\
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Crect x='"'"'0'"'"' y='"'"'0'"'"' width='"'"'200'"'"' height='"'"'140'"'"' rx='"'"'60'"'"'/%3E%3Crect x='"'"'0'"'"' y='"'"'100'"'"' width='"'"'200'"'"' height='"'"'140'"'"' rx='"'"'60'"'"'/%3E%3C/svg%3E");\
          }\
          \
          &[data-shape="1"] .team-avatar-wrap {\
            background-color: #fcab6c;\
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Cpath d='"'"'M 0,100 A 100 100 0 0 1 200,100 L 200,240 L 0,240 Z'"'"'/%3E%3C/svg%3E");\
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Cpath d='"'"'M 0,100 A 100 100 0 0 1 200,100 L 200,240 L 0,240 Z'"'"'/%3E%3C/svg%3E");\
          }\
          \
          &[data-shape="2"] .team-avatar-wrap {\
            background-color: #ebe266;\
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Ccircle cx='"'"'100'"'"' cy='"'"'120'"'"' r='"'"'100'"'"'/%3E%3C/svg%3E");\
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Ccircle cx='"'"'100'"'"' cy='"'"'120'"'"' r='"'"'100'"'"'/%3E%3C/svg%3E");\
          }\
          \
          &[data-shape="3"] .team-avatar-wrap {\
            background-color: #23b6fa;\
            mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Crect x='"'"'0'"'"' y='"'"'20'"'"' width='"'"'200'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3Crect x='"'"'15'"'"' y='"'"'85'"'"' width='"'"'170'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3Crect x='"'"'0'"'"' y='"'"'150'"'"' width='"'"'200'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3C/svg%3E");\
            -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='"'"'http://www.w3.org/2000/svg'"'"' viewBox='"'"'0 0 200 240'"'"'%3E%3Crect x='"'"'0'"'"' y='"'"'20'"'"' width='"'"'200'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3Crect x='"'"'15'"'"' y='"'"'85'"'"' width='"'"'170'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3Crect x='"'"'0'"'"' y='"'"'150'"'"' width='"'"'200'"'"' height='"'"'70'"'"' rx='"'"'35'"'"'/%3E%3C/svg%3E");\
          }\
\
          .team-bottom-content {\
            display: flex;\
            flex-direction: column;\
            align-items: center;\
            gap: 8px;\
\
            .team-name {\
              font-size: 20px;\
              font-weight: 600;\
              color: #141b2b;\
              margin: 0;\
            }\
\
            .team-role {\
              font-size: 14px;\
              color: #707881;\
            }\
\
            .team-social-icons {\
              display: flex;\
              align-items: center;\
              gap: 16px;\
              margin-top: 12px;\
              color: #141b2b;\
\
              svg {\
                transition: color 0.2s;\
                cursor: pointer;\
                &:hover {\
                  color: $primary;\
                }\
              }\
            }\
\
            .team-follow-wrapper {\
              margin-top: 16px;\
            }\
          }\
        }\
      }\
    }\
  }' scss/pc/homepage/homepage.scss
