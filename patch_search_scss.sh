awk '
/\.filter-location,/ {
    print "          .search-field-wrapper {"
    print "            position: relative;"
    print "            display: flex;"
    print "            align-items: center;"
    print "          }"
    print ""
    print "          .filter-location,"
    next
}
/top: 80px;/ {
    print "            bottom: calc(100% + 10px);"
    print "            left: 0;"
    print "            top: auto;"
    next
}
/\.filter-location {/ {
    skip = 1;
    next
}
/right: 100px;/ {
    skip = 0;
    next
}
/          }/ {
    if (skip == 1) {
        # skipped
    } else {
        print $0
    }
    next
}
{
    if (skip == 1) {
        # skip lines like left: 0; filter-type { left: 50% } etc
    } else {
        print $0
    }
}
' scss/pc/homepage/homepage.scss > temp.scss && mv temp.scss scss/pc/homepage/homepage.scss
