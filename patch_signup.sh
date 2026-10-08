awk '
/{\/\* SIGN IN \*\// {
    print "            <button type=\"button\" className=\"social-btn\" onClick={handlePhoneSignup}>"
    print "              <span className=\"material-symbols-outlined\" style={{ fontSize: 18 }}>smartphone</span>"
    print "              <span>Phone</span>"
    print "            </button>"
    print "          </div>"
    print ""
    print $0
    next
}
/<\/div>/ {
    # If the previous lines were the end of Telegram button, we skip this div
    if (skip_div == 1) {
        skip_div = 0
        next
    }
}
/<span>Telegram<\/span>/ {
    print $0
    skip_div = 1
    # Actually, skipping the next </div> is hard if there are buttons.
    # Let us just rebuild the social-grid section entirely to be safe!
}
{ print $0 }
' libs/components/account/SignUp.tsx > temp.tsx
