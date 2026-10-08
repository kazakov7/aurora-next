const fs = require('fs');
let content = fs.readFileSync('scss/pc/homepage/homepage.scss', 'utf8');

// Insert search-field-wrapper
content = content.replace('.filter-location,',
`.search-field-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .filter-location,`);

// Replace top: 80px
content = content.replace('top: 80px;', 'bottom: calc(100% + 10px);\n            left: 0;\n            top: auto;');

// Remove the individual positioning rules
const toRemove = 
`.filter-location {
            left: 0;
          }
          .filter-type {
            left: 50%;
            transform: translateX(-50%);
          }
          .filter-rooms {
            right: 100px;
          }`;

content = content.replace(toRemove, '');

fs.writeFileSync('scss/pc/homepage/homepage.scss', content);
