const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'scss/pc/admin/admin.scss');
let scssContent = fs.readFileSync(filePath, 'utf-8');

const regex = /\.admin-drawer\s*\{[\s\S]*?(?=\n\t\t\/\*|\n\t\/\*|\n\t\}|\n\})/g;

const newDrawerScss = `.admin-member-drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 720px;
    max-width: 100vw;
    background-color: #ffffff;
    z-index: 1000;
    box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1);

    .drawer-header {
      height: 64px;
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #dce2f7;
      background-color: #ffffff;

      .header-title {
        display: flex;
        align-items: center;
        gap: 12px;

        .icon-main {
          color: #006399;
          font-size: 22px;
        }

        .title-text {
          font-size: 18px;
          font-weight: 600;
          color: #141b2b;
        }

        .id-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background-color: #e9edff;
          color: #004f7b;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          margin-left: 8px;

          .copy-icon {
            font-size: 14px;
            cursor: pointer;
            opacity: 0.7;
            &:hover { opacity: 1; }
          }
        }
      }

      .close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: #545c72;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          background-color: #f1f3ff;
          color: #141b2b;
        }
      }
    }

    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 32px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      background-color: #ffffff;

      .top-profile-card {
        background-color: #f6f8fd;
        border-radius: 16px;
        border: 1px solid #e1e8fd;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 24px;

        .card-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;

          .avatar-section {
            display: flex;
            align-items: center;
            gap: 20px;

            .avatar-wrapper {
              position: relative;
              width: 72px;
              height: 72px;
              border-radius: 50%;
              background-color: #cde5ff;
              border: 3px solid #ffffff;
              box-shadow: 0 2px 8px rgba(0,0,0,0.06);
              flex-shrink: 0;

              img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                object-fit: cover;
              }

              .avatar-initials {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                font-weight: 700;
                color: #004b73;
              }

              .verified-badge {
                position: absolute;
                bottom: -2px;
                right: -2px;
                width: 22px;
                height: 22px;
                background-color: #006399;
                color: #ffffff;
                border-radius: 50%;
                border: 2px solid #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;

                .material-symbols-outlined {
                  font-size: 14px;
                  font-weight: 700;
                }
              }
            }

            .identity-info {
              display: flex;
              flex-direction: column;
              gap: 6px;

              .name-line {
                display: flex;
                align-items: center;
                gap: 12px;

                h2 {
                  margin: 0;
                  font-size: 22px;
                  font-weight: 700;
                  color: #141b2b;
                }

                .id-verified-pill {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  background-color: #dce2f7;
                  color: #004f7b;
                  padding: 2px 8px;
                  border-radius: 999px;
                  font-size: 11px;
                  font-weight: 600;

                  .material-symbols-outlined {
                    font-size: 13px;
                  }
                }
              }

              .meta-line {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: #545c72;

                .dot {
                  color: #bfc7d2;
                }
              }
            }
          }

          .tags-section {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;

            .role-tags {
              display: flex;
              align-items: center;
              gap: 8px;

              .tag-primary {
                background-color: #cce5ff;
                color: #004b73;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 700;
              }

              .tag-secondary {
                background-color: #e1e8fd;
                color: #3f465c;
                padding: 4px 10px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
              }
            }

            .status-indicator {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 13px;
              font-weight: 600;
              background-color: #ffffff;
              padding: 4px 12px;
              border-radius: 999px;
              border: 1px solid #dce2f7;

              .dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
              }

              &.active .dot { background-color: #059669; }
              &.blocked .dot { background-color: #dc2626; }
              &.deleted .dot { background-color: #52525b; }
            }
          }
        }

        .card-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 16px;
          border-top: 1px solid #dce2f7;
          font-size: 12px;
          color: #545c72;

          .bottom-left {
            .auth-info {
              display: flex;
              align-items: center;
              gap: 6px;
              
              .material-symbols-outlined {
                font-size: 16px;
                color: #006399;
              }
            }
          }

          .bottom-right {
            display: flex;
            align-items: center;
            gap: 8px;

            .dot {
              color: #bfc7d2;
            }

            .highlight {
              color: #006399;
              font-weight: 500;
            }
          }
        }
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;

        .stat-card {
          background-color: #f8fafc;
          border: 1px solid #f1f3ff;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;

          .stat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .stat-title {
              font-size: 11px;
              font-weight: 600;
              color: #545c72;
              letter-spacing: 0.05em;
            }

            .icon {
              font-size: 18px;
              color: #006399;
            }
          }

          .stat-main {
            display: flex;
            align-items: baseline;
            gap: 6px;

            .stat-val {
              font-size: 24px;
              font-weight: 700;
              color: #141b2b;
            }

            .stat-subval {
              font-size: 13px;
              font-weight: 500;
              color: #545c72;

              &.active {
                color: #006399;
              }

              &.highlight .material-symbols-outlined {
                font-size: 18px;
                color: #006399;
                transform: translateY(3px);
              }
            }
          }

          .stat-footer {
            font-size: 11px;
            color: #707881;
          }
        }
      }

      .drawer-tabs {
        display: flex;
        align-items: center;
        border-bottom: 1px solid #dce2f7;
        gap: 32px;

        .tab-btn {
          background: none;
          border: none;
          padding: 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #545c72;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;

          &:hover {
            color: #141b2b;
          }

          &.active {
            color: #006399;

            &::after {
              content: '';
              position: absolute;
              bottom: -1px;
              left: 0;
              right: 0;
              height: 3px;
              background-color: #006399;
              border-radius: 3px 3px 0 0;
            }
          }

          .badge {
            background-color: #e9edff;
            color: #004f7b;
            font-size: 11px;
            padding: 2px 8px;
            border-radius: 999px;
          }
        }
      }

      .tab-content {
        .overview-section {
          display: flex;
          flex-direction: column;
          gap: 20px;

          .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            
            &.mt-6 {
              margin-top: 24px;
            }

            .title {
              display: flex;
              align-items: center;
              gap: 8px;

              .material-symbols-outlined {
                color: #006399;
                font-size: 20px;
              }

              h4 {
                margin: 0;
                font-size: 15px;
                font-weight: 600;
                color: #141b2b;
              }
            }

            .edit-link {
              background: none;
              border: none;
              color: #006399;
              font-size: 13px;
              font-weight: 500;
              cursor: pointer;

              &:hover {
                text-decoration: underline;
              }
            }

            .verified-badge-label {
              background-color: #e9edff;
              color: #004f7b;
              padding: 4px 12px;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 600;
            }
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;

            .info-box {
              background-color: #f8fafc;
              border-radius: 8px;
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 6px;

              &.full-width {
                grid-column: span 2;
              }

              .info-label {
                font-size: 11px;
                color: #707881;
              }

              .info-value {
                font-size: 14px;
                font-weight: 500;
                color: #141b2b;
              }

              .info-value-row {
                display: flex;
                align-items: center;
                justify-content: space-between;

                .copy-icon {
                  font-size: 16px;
                  color: #bfc7d2;
                  cursor: pointer;

                  &:hover {
                    color: #545c72;
                  }
                }
              }

              &.bio .info-value {
                font-weight: 400;
                line-height: 1.6;
                color: #3f4850;
              }
            }
          }
        }
      }
    }

    .drawer-footer {
      padding: 24px 32px;
      border-top: 1px solid #dce2f7;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #ffffff;

      .footer-left {
        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          background: none;

          &.btn-danger {
            border: 1px solid #fee2e2;
            color: #dc2626;

            &:hover {
              background-color: #fef2f2;
            }
          }

          &.btn-success {
            border: 1px solid #d1fae5;
            color: #059669;

            &:hover {
              background-color: #ecfdf5;
            }
          }

          .material-symbols-outlined {
            font-size: 18px;
          }
        }
      }

      .footer-right {
        display: flex;
        align-items: center;
        gap: 12px;

        button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;

          &.btn-outline {
            border: 1px solid #dce2f7;
            background-color: #ffffff;
            color: #3f4850;

            &:hover {
              background-color: #f8fafc;
            }
          }

          &.btn-primary {
            border: none;
            background-color: #006399;
            color: #ffffff;

            &:hover {
              background-color: #004b73;
            }
          }

          .material-symbols-outlined {
            font-size: 18px;
          }
        }
      }
    }
  }`;

scssContent = scssContent.replace(regex, newDrawerScss);
fs.writeFileSync(filePath, scssContent);
console.log('Replaced drawer SCSS!');
