awk '
BEGIN { skip = 0; }
/<div className="editorial-panel">/ {
    print "      {/* Right Column: Immersive Luxury Editorial Feature */}"
    print "      <div className=\"editorial-panel\">"
    print "        <img"
    print "          alt=\"Swiss Alps sanctuary luxury retreat\""
    print "          className=\"bg-visual-img\""
    print "          src=\"https://lh3.googleusercontent.com/aida-public/AB6AXuCkvikJZPxn7yNSStoZcrIZiB9AtnKNq6QmfTprY_UCYBPyotZKq5F1P_-rWXJYgWpYKPkDXR5PlGZzy1pp8G8YEWrl-Vl3ZwzQ5LVxuqo_EOmUc-tLbl-2emPIA9q9I4Eeot93ADLf263PGUWrleJirgxadKRfye7QuCgIygtkavdIU4MytCH7a0E7ueii6KfAknxKjPicub1MI4auuIH0QNF_uxkQzwGxUUX30_BmJIvBodlYQfYA\""
    print "        />"
    print "        <div className=\"scrim-overlay\"></div>"
    print "        <div className=\"scrim-side\"></div>"
    print ""
    print "        {/* Top Tag Row */}"
    print "        <div className=\"top-badge-row\">"
    print "          <div className=\"collection-tag\">"
    print "            <span className=\"material-symbols-outlined\">verified</span>"
    print "            <span>Swiss Alps · Sanctuary Collection</span>"
    print "          </div>"
    print "          <button type=\"button\" className=\"info-btn\" aria-label=\"Explore sanctuary\">"
    print "            <span className=\"material-symbols-outlined\">explore</span>"
    print "          </button>"
    print "        </div>"
    print ""
    print "        {/* Bottom Content Narrative */}"
    print "        <div className=\"bottom-content\">"
    print "          <span className=\"feature-eyebrow\">Editorial Feature</span>"
    print "          <h2>Your next journey starts here.</h2>"
    print "          <p>Curated stays, bespoke expeditions, and private alpine retreats across the world.</p>"
    print "          <div className=\"indicator-pills\">"
    print "            <span className=\"pill active\"></span>"
    print "            <span className=\"pill inactive\"></span>"
    print "            <span className=\"pill inactive\"></span>"
    print "          </div>"
    print "        </div>"
    print "      </div>"
    skip = 1
    next
}
/<\/div>$/ {
    if (skip == 1) {
        # This is the end of the file or the end of the previous editorial panel
        # Actually, let us just match up to the end of the component
    }
}
' libs/components/account/SignUp.tsx > temp.tsx
