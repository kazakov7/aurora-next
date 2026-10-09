const fs = require('fs');

let code = fs.readFileSync('pages/checkout/index.tsx', 'utf-8');

// Replace Top with the original header
code = code.replace(
    /import Top from "\.\.\/\.\.\/libs\/components\/Top";\n/,
    ""
);

if (!code.includes('getImageUrl')) {
    code = code.replace(
        "import { useReactiveVar } from \"@apollo/client\";",
        "import { useReactiveVar } from \"@apollo/client\";\nimport { DEFAULT_USER_AVATAR, getImageUrl } from \"../../libs/config\";"
    );
}

const headerHTML = `      <header className="checkout-header">
        <div className="header-container">
          <div className="logo" onClick={() => router.push("/")} style={{ cursor: 'pointer' }}>AURORA</div>
          <nav className="nav-links">
            <a href="/" onClick={(e) => { e.preventDefault(); router.push("/"); }}>Home</a>
            <a href="/property" className="active" onClick={(e) => { e.preventDefault(); router.push("/property"); }}>Hotels</a>
            <a href="/tour" onClick={(e) => { e.preventDefault(); router.push("/tour"); }}>Tours</a>
            <a href="/destination" onClick={(e) => { e.preventDefault(); router.push("/destination"); }}>Destinations</a>
            <a href="/community" onClick={(e) => { e.preventDefault(); router.push("/community"); }}>Community</a>
          </nav>
          <div className="header-actions">
            <div className="search-bar">
              <span className="material-symbols-outlined search-icon">search</span>
              <input type="text" placeholder="Explore stays, places..." />
            </div>
            <div className="lang-currency">
              <span className="material-symbols-outlined">language</span>
              <span>USD / EN</span>
            </div>
            <img src={getImageUrl(user?.memberImage, DEFAULT_USER_AVATAR)} alt="Profile" className="profile-img" />
          </div>
        </div>
      </header>`;

code = code.replace(
    /      <Top \/>/,
    headerHTML
);

fs.writeFileSync('pages/checkout/index.tsx', code);
console.log("Restored custom checkout-header");
