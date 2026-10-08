import re

with open("scss/pc/chat/chat.scss", "r") as f:
    content = f.read()

new_dossier = """    .chat-dossier-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 1px 4px rgba(20, 27, 43, 0.04);
      border: 1px solid rgba(220, 226, 247, 0.7);
      overflow-y: auto;
      padding: 24px;
      gap: 20px;

      @media (max-width: 1200px) {
        display: none;
      }

      .dossier-profile-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        
        .dossier-avatar-box {
          position: relative;
          margin-bottom: 12px;

          .dossier-avatar {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            object-fit: cover;
            border: 1px solid #f1f3ff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .dossier-avatar-placeholder {
            width: 84px;
            height: 84px;
            border-radius: 50%;
            background: #e9edff;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #dce2f7;

            .material-symbols-outlined {
              font-size: 40px;
              color: #006194;
            }
          }
        }

        .name-verified-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin-bottom: 6px;

          h3 {
            font-size: 20px;
            font-weight: 600;
            color: #141b2b;
            margin: 0;
            letter-spacing: -0.01em;
          }
          
          .verified-icon {
            font-size: 16px;
            color: #007bb9;
          }
        }

        .dossier-role-badge {
          display: inline-block;
          padding: 3px 10px;
          background: #f1f3ff;
          color: #006194;
          font-size: 12px;
          font-weight: 600;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .dossier-stats-grid {
          display: flex;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
          margin-bottom: 20px;
          
          .stat-card {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 10px 4px;
            background: #f9f9ff;
            border-radius: 12px;
            border: 1px solid #f1f3ff;
            
            .stat-val {
              font-size: 16px;
              font-weight: 600;
              color: #141b2b;
            }
            .stat-lbl {
              font-size: 11px;
              color: #707881;
              margin-top: 2px;
            }
          }
        }

        .dossier-actions-grid {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;

          .btn-view-profile {
            width: 100%;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #ffffff;
            color: #141b2b;
            border: 1px solid #dce2f7;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              background: #f9f9ff;
              border-color: #bfc7d2;
            }
          }
        }
      }

      .dossier-divider {
        height: 1px;
        background: #f1f3ff;
        width: 100%;
      }

      .dossier-section {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #707881;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .about-row {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 8px;
          
          .about-lbl {
            font-size: 12px;
            color: #707881;
            font-weight: 500;
          }
          .about-val {
            font-size: 14px;
            color: #141b2b;
            line-height: 1.4;
          }
        }
        
        .agent-info-card {
          background: #f9f9ff;
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid #f1f3ff;
          
          .agent-info-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            
            .ai-lbl {
              font-size: 12px;
              color: #707881;
            }
            .ai-val {
              font-size: 13px;
              color: #141b2b;
              font-weight: 500;
              text-align: right;
              max-width: 130px;
            }
          }
        }

        .shared-files-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .left-group {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #141b2b;
            font-weight: 600;
            font-size: 14px;

            .material-symbols-outlined {
              font-size: 18px;
              color: #707881;
            }
          }

          .item-count {
            font-size: 12px;
            color: #707881;
          }
        }

        .files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .file-item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: #f9f9ff;
            border-radius: 10px;
            
            .file-info-left {
              display: flex;
              align-items: center;
              gap: 8px;

              .file-icon {
                font-size: 16px;
                color: #707881;
              }
              .file-name {
                font-size: 13px;
                color: #3f4850;
              }
            }
          }
        }
      }
    }"""

content = re.sub(r"    \.chat-dossier-panel \{.*?(?=    \.chat-thread-panel|\Z)", new_dossier + "\n\n", content, flags=re.DOTALL)

with open("scss/pc/chat/chat.scss", "w") as f:
    f.write(content)
