sed -i '' -e 's/display: grid;/display: flex;/g' scss/pc/account/join.scss
sed -i '' -e 's/grid-template-columns: repeat(4, 1fr);/width: 100%;/g' scss/pc/account/join.scss
sed -i '' -e '/\.social-btn {/a\
\					flex: 1;
' scss/pc/account/join.scss
