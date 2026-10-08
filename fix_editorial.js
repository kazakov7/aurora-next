const fs = require('fs');
let content = fs.readFileSync('libs/components/account/SignUp.tsx', 'utf8');

const startIdx = content.indexOf('<div className="editorial-panel">');
const endIdx = content.lastIndexOf('</div>'); // The end of SignUp
const actualEndIdx = content.lastIndexOf('</div>', endIdx - 1); // The end of auth-split-card
const panelEndIdx = content.lastIndexOf('</div>', actualEndIdx - 1); // The end of editorial-panel

// Better way: regex match everything from <div className="editorial-panel"> to the end, then reconstruct.
const replacement = `      {/* Right Column: Immersive Luxury Editorial Feature */}
      <div className="editorial-panel">
        <img
          alt="Swiss Alps sanctuary luxury retreat"
          className="bg-visual-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkvikJZPxn7yNSStoZcrIZiB9AtnKNq6QmfTprY_UCYBPyotZKq5F1P_-rWXJYgWpYKPkDXR5PlGZzy1pp8G8YEWrl-Vl3ZwzQ5LVxuqo_EOmUc-tLbl-2emPIA9q9I4Eeot93ADLf263PGUWrleJirgxadKRfye7QuCgIygtkavdIU4MytCH7a0E7ueii6KfAknxKjPicub1MI4auuIH0QNF_uxkQzwGxUUX30_BmJIvBodlYQfYA"
        />
        <div className="scrim-overlay"></div>
        <div className="scrim-side"></div>

        {/* Top Tag Row */}
        <div className="top-badge-row">
          <div className="collection-tag">
            <span className="material-symbols-outlined">verified</span>
            <span>Swiss Alps · Sanctuary Collection</span>
          </div>
          <button type="button" className="info-btn" aria-label="Explore sanctuary">
            <span className="material-symbols-outlined">explore</span>
          </button>
        </div>

        {/* Bottom Content Narrative */}
        <div className="bottom-content">
          <span className="feature-eyebrow">Editorial Feature</span>
          <h2>Your next journey starts here.</h2>
          <p>Curated stays, bespoke expeditions, and private alpine retreats across the world.</p>
          <div className="indicator-pills">
            <span className="pill active"></span>
            <span className="pill inactive"></span>
            <span className="pill inactive"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
`;

const newContent = content.substring(0, startIdx) + replacement;
fs.writeFileSync('libs/components/account/SignUp.tsx', newContent);
