const fs = require('fs');

let code = fs.readFileSync('scss/pc/destination/destination-detail.scss', 'utf-8');

const oldCss = `					.traveler-bio {
						font-size: 13px;
						color: $on-surface-variant;
						margin: 6px 0 0 0;
						line-height: 1.4;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
						overflow: hidden;
					}`;

const newCss = `					.traveler-bio {
						font-size: 13px;
						color: $on-surface-variant;
						margin: 6px 0 0 0;
						line-height: 1.4;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
						width: 100%;
					}`;

if (code.includes(oldCss)) {
    code = code.replace(oldCss, newCss);
    fs.writeFileSync('scss/pc/destination/destination-detail.scss', code);
    console.log("Updated successfully");
} else {
    console.log("Could not find the exact string to replace");
}
