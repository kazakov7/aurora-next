sed -i '' -e '1458,1541c\
      .travelers-destination-grid {\
        display: flex;\
        align-items: center;\
        justify-content: center;\
        gap: 20px;\
        width: 100%;\
\
        .traveler-destination-card {\
          position: relative;\
          border-radius: 16px;\
          overflow: hidden;\
          cursor: pointer;\
          border: none;\
          padding: 0;\
          background: #e9edff;\
          transition: all 0.3s ease;\
\
          &:hover {\
            transform: translateY(-8px);\
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);\
          }\
\
          &.small {\
            width: 180px;\
            height: 260px;\
          }\
\
          &.medium {\
            width: 220px;\
            height: 340px;\
          }\
\
          &.featured {\
            width: 260px;\
            height: 420px;\
          }\
\
          img {\
            width: 100%;\
            height: 100%;\
            object-fit: cover;\
          }\
\
          .destination-scrim {\
            position: absolute;\
            inset: 0;\
            background: linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 50%);\
          }\
\
          .destination-info {\
            position: absolute;\
            bottom: 0;\
            left: 0;\
            right: 0;\
            padding: 20px;\
            text-align: left;\
\
            .top-pick-label {\
              display: inline-block;\
              background: #006194;\
              color: #ffffff;\
              font-size: 11px;\
              font-weight: 600;\
              text-transform: uppercase;\
              letter-spacing: 0.05em;\
              padding: 4px 10px;\
              border-radius: 9999px;\
              margin-bottom: 8px;\
            }\
\
            h3 {\
              color: #ffffff;\
              font-size: 20px;\
              font-weight: 600;\
              margin: 0 0 4px 0;\
              text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);\
            }\
\
            p {\
              color: rgba(255, 255, 255, 0.85);\
              font-size: 13px;\
              margin: 0;\
            }\
          }\
        }\
      }\
' scss/pc/homepage/homepage.scss
