const fs = require('fs');

let content = fs.readFileSync('libs/components/account/SignUp.tsx', 'utf8');

const telegramBtn = `              <span>Telegram</span>
            </button>`;

const replacement = `              <span>Telegram</span>
            </button>

            {/* PHONE SIGNUP */}
            <button
              type="button"
              className="social-btn"
              onClick={handlePhoneSignup}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>smartphone</span>
              <span>Phone</span>
            </button>`;

content = content.replace(telegramBtn, replacement);

fs.writeFileSync('libs/components/account/SignUp.tsx', content);
