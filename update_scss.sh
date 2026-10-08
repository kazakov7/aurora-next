awk '
BEGIN { skip = 0; }
/\/\* SIGN IN CARD \*\// { skip = 1; next; }
/\/\* SIGN UP CARD \*\// { next; }
/^\t\t\.signin-card {/ {
    print "\t\t/* SHARED AUTH CARD */"
    print "\t\t.auth-split-card {"
    print "\t\t\twidth: 100%;"
    print "\t\t\tmax-width: 1200px;"
    print "\t\t\tbackground: #ffffff;"
    print "\t\t\tborder-radius: 28px;"
    print "\t\t\tbox-shadow: 0 10px 40px -6px rgba(20, 27, 43, 0.09), 0 4px 16px -2px rgba(20, 27, 43, 0.05);"
    print "\t\t\tborder: 1px solid rgba(220, 226, 247, 0.6);"
    print "\t\t\toverflow: hidden;"
    print "\t\t\tdisplay: grid;"
    print "\t\t\tgrid-template-columns: 1fr 1fr;"
    print "\t\t\tmin-height: 640px;"
    print ""
    print "\t\t\t@media (max-width: 1024px) {"
    print "\t\t\t\tgrid-template-columns: 1fr;"
    print "\t\t\t}"
    print "\t\t}"
    skip = 1
    next
}
/^\t\t\.signup-card {/ {
    skip = 1
    next
}
/^\t\t\/\* LEFT FORM PANEL \*\// {
    skip = 0
}
{
    if (skip == 0) {
        print $0
    }
}
' scss/pc/account/join.scss > temp.scss && mv temp.scss scss/pc/account/join.scss
