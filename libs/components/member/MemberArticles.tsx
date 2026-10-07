import React, { useState } from 'react';
import Link from 'next/link';

interface ArticleData {
	id: string;
	title: string;
	excerpt: string;
	category: string;
	image: string;
	date: string;
	readTime: string;
	likes: number;
	views: string;
	bookmarked?: boolean;
}

const sampleArticles: ArticleData[] = [
	{
		id: 'art-1',
		title: 'Solitude at 3,000m: High Alpine Cabins of Zermatt',
		excerpt:
			'A photographic study of shelter and stark geometry amid the Pennine Alps, where silent sunrises greet solitary climbers before first light.',
		category: 'Expedition Log',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBYs5tFD4wiWlMRwjcXwSmW80n7hXNpqeWysJdEK4jR6Rok3ASiJgOPkHfKNXrBxCPn1AhSBuv6ApOenZmSSUh6-dnjYlElKmB6Uv8an7EASqwyI1LTn0eDEA4HGuQgc68XZIRyFQAaBxZkBzjk9lMjja97UQ43CD1uu5qLr5T5mU-MgCnBFIC9mwjcJULGblmDOqXnoQLTHhqgqWUZM73Ic4rTWpHW-f0CLyPjKa-EqKE5p7ybzIZZ',
		date: 'Oct 12, 2024',
		readTime: '6 min read',
		likes: 184,
		views: '2.8k',
	},
	{
		id: 'art-2',
		title: 'A Quiet Morning in Gion, Kyoto: Beyond the Bamboo Forest',
		excerpt:
			'Documenting centuries-old cedar latticework and the hushed rhythm of early morning tea deliveries before the ancient capital awakens.',
		category: 'Local Insights',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDlwRII0TgihawSfWJmrAuylie2PUlXlZG6vBAlAccLhmkLvZoa0DzpYW82Gg38FLSqkCRVHWMqhjxrmBJ2HKVuQYxu02KE4-RbpRUA4Lf2KRiMQzwp6NMW_cjx7JMPhGHhY_nsgpsF12Aroqj1Q4r44Iw1ZR5o2Df3Rk8noOO50xilMe3gAvdZVqywm5-TmEsS8pZTSTlsQZQl7bRBoZx87F_eURZMyjLj-p14gxKDPAFYiRnNYXd-',
		date: 'Sep 28, 2024',
		readTime: '8 min read',
		likes: 242,
		views: '3.9k',
	},
	{
		id: 'art-3',
		title: 'Midnight Arctic Glow: Forty Hours Along the Reinefjorden',
		excerpt:
			'Tracing continuous violet twilight across jagged Scandinavian sea stacks and weathered timber outposts on the edge of the Norwegian Sea.',
		category: 'Photography',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCmiqXj3nbjRxryXkCGMk6UVQygbTB8gKvt4yNl7GYp9HkJVMIqxFxP0-ZIYUOaq-U16tMVt5bhd9KEhOqjGy-1EkgpGc5MIZwUBpUDemxTOX-txyanR_lufnepzyyqmbO47wbjTexWT0jM1BvY-XuBni__RglC_L2e8eAbfWiybPk5WxjAUCx8KdxB-Ua1sLQuB2XLA5xzzekX2fYMb6pn4KqVOSAygP2b0URVvUqAjp3eyUwa66za',
		date: 'Aug 19, 2024',
		readTime: '5 min read',
		likes: 315,
		views: '4.5k',
	},
	{
		id: 'art-4',
		title: 'Stilts and Sea Salt: Modernist Isolation on Fogo Island',
		excerpt:
			'Examining how contemporary stilt architecture dialogues with brutal subarctic winds, traditional outport carpentry, and open horizons.',
		category: 'Architecture',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuA7dMuJbRNQQdTZ8_5UWen05yshqWugXdJy-h9nt9b0NqHG8Zuo0SuXjow1w9vETIn-6YWv2J208vjxR93Q8VwBbBxj4XF8ZAC4Xf06HQoYKz87CHcNbp0dmFInQFQRiojNMMG7WTmERA3dLP4loGXnc1MoN_2vTPHYUOiWoOhowYt9RrdR8rJWQJehsp0NYSU9QMecIyybgTbwxAItGMODr80nFKcgA5jptkQa5p2Psu05A25VcWvD',
		date: 'Jul 30, 2024',
		readTime: '7 min read',
		likes: 196,
		views: '2.1k',
	},
	{
		id: 'art-5',
		title: 'Subterranean Sanctuaries: Troglodyte Stays of Anatolia',
		excerpt:
			'A 5-day route through carved volcanic stone vaults, secluded pigeon valleys, and restorative thermal courtyards in Göreme.',
		category: 'Itineraries',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuABQuw9y0Gg62LQKPI0ot0BJh1kvNEh0MitF6i6DQK441qoovEU_GPohzYacOFQHZ4BcNc_6repgqSjq8XJioPylQCsLphNUxW7Pp4jYflRfd1t4dfzAav-5tWQFGPjhgLmRZHkbN4fxlfdFNjOHXHxtaFx4RhFBxq9uOYXAOAwIyn8T_6tGF86icmSE6-odq53QJ2QKt_kireaKVFtTUV3A3WhYGEdZ21h8xPsHb4STdjPpuCUKcpr',
		date: 'Jul 14, 2024',
		readTime: '9 min read',
		likes: 278,
		views: '3.3k',
	},
	{
		id: 'art-6',
		title: 'Dolomite Alpenglow: High Pass Traverses in South Tyrol',
		excerpt:
			'Traversing limestone massifs when the sun dips low and strikes vertical rock walls with intense crimson and copper radiance.',
		category: 'Expedition Log',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDQbBlEpiYdmX4oBFqax4ULNtqTOlo5sEw1gYGAWu_bP0UDFum35i6_vJH5wgmDyZUB0ZteVneiPF0r8chzRS1GLVTgGZtdurcHfpjzD6VwdZ5eTqpc6ArPEGnQsAN0lh49tSQU6xD6gLZXjGI5IMIud-fNfA5TbYaisX3M5_PF6aO-oJmre-M_RoqH6XAgyAy7cLb64lHUMZMG7QcZZp7dIndBWqxdokxxjUsxnapHOW3Zyukjgf61',
		date: 'Jun 22, 2024',
		readTime: '6 min read',
		likes: 402,
		views: '5.1k',
	},
	{
		id: 'art-7',
		title: 'Adobe and Starlight: The Desert Observatories of San Pedro',
		excerpt:
			'A review of ram-earthed eco-lodges designed for celestial clarity, where private courtyards mirror the astronomical silence of the altiplano.',
		category: 'Hotel Reviews',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAROYI4qPXV0j1dH0El6EQbcH7sVaVVZIQTpTAI-scNLo8LO2ZbT67N18zb9nZGMD8UNlWVGByULvjDqBDJq6qhL2mCWeLYCVNU0DiQbGKmEiIayQL3PcVth-kbcDhKpIEoq330bZr6-DRU8rhgiqJiX853-2ivQZ4T7JyI-M0cUS3BJcsNWzGEZqvCy6yKI5ZT4Kr_fKs6i9G_O5SQa5dZLTz7QTT80T0aK54bWfS9Ghj_G4AbeGGi',
		date: 'May 11, 2024',
		readTime: '7 min read',
		likes: 164,
		views: '1.9k',
	},
	{
		id: 'art-8',
		title: 'Pillars of Faith: The Suspended Monasteries of Meteora',
		excerpt:
			'Documenting monastic hermitages perched atop monolithic conglomerate pillars in Thessaly, suspended between earth and the Aegean heavens.',
		category: 'Architecture',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBYT9OngX1t3bC3NpKEcX23muw7dALZNbsx9K8xvF_sBxd8efKPpFaEq4SF78uLoGCEzXUffHRa1I5bhQVKwlaFUN_ajy0wuTdw7eBWlLjh2ARlaIY5pAKtJjncIycmzZRZoVLemHw7zYAkNi7iix_Vw1kSK0PHA2da7ExdeE_ojBsWX4fs4hS9NaHEX2R01nummkCYXNZYZU-UXXca1owRD4r3uBXEYPZFnuCqDs2lEgn7mo0fUKrC',
		date: 'Apr 29, 2024',
		readTime: '6 min read',
		likes: 229,
		views: '3.1k',
	},
	{
		id: 'art-9',
		title: 'Windward Archipelago: 72 Hours in the Outer Faroes',
		excerpt:
			'Navigating sheer sea-girt basalt palisades, turf-roofed hamlets, and solitary sea stacks where the North Atlantic commands total surrender.',
		category: 'Expedition Log',
		image:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuCYZVT2wgVz3fFx55tn2LrMnsnGLTA2EaKgcfue8kDLXLDv9ck5B6aYkT5mrfBk5tkCeDswJJVmywAi_MTm6Ioflwa7zz2cTJoYhN5elmSdzlkGFwo8NBT9vf9W6VUeg6gwbf1ot75Rd42UiZRciKhbIFLRsQYG7MfmhVI26AcwbMWgS-gz-PWMDb6AlDNQAzTafsK2yWW_UDGmhYT3OgSMfeNoExFRX1SdzzSpp-QkTsA5gNv0nuJH',
		date: 'Apr 04, 2024',
		readTime: '10 min read',
		likes: 388,
		views: '4.7k',
	},
];

interface MemberArticlesProps {
	memberName?: string;
	articles?: any[];
}

const MemberArticles: React.FC<MemberArticlesProps> = ({
	memberName = 'Julian Laurent',
	articles,
}) => {
	const [sortFilter, setSortFilter] = useState<'newest' | 'liked' | 'viewed'>('newest');
	const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
	const [page, setPage] = useState<number>(1);

	const displayArticles = sampleArticles;

	const handleBookmarkToggle = (id: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setBookmarks((prev) => ({ ...prev, [id]: !prev[id] }));
	};

	return (
		<main className="member-articles-content">
			{/* Content Header & Sort Filter */}
			<div className="content-header-bar">
				<div className="title-block">
					<div className="title-row">
						<h2>Articles</h2>
						<span className="published-badge">18 published</span>
					</div>
					<p className="subtitle">
						Travel journals, photo-essays, and architectural chronicles by {memberName}.
					</p>
				</div>

				{/* Public Sort Pill Selector */}
				<div className="sort-pills-box">
					<button
						type="button"
						className={`sort-pill ${sortFilter === 'newest' ? 'active' : ''}`}
						onClick={() => setSortFilter('newest')}
					>
						Newest
					</button>
					<button
						type="button"
						className={`sort-pill ${sortFilter === 'liked' ? 'active' : ''}`}
						onClick={() => setSortFilter('liked')}
					>
						Most Liked
					</button>
					<button
						type="button"
						className={`sort-pill ${sortFilter === 'viewed' ? 'active' : ''}`}
						onClick={() => setSortFilter('viewed')}
					>
						Most Viewed
					</button>
				</div>
			</div>

			{/* Articles Grid (3 cols desktop x 3 rows = 9 cards) */}
			{displayArticles.length > 0 ? (
				<div className="articles-grid" id="articles-grid">
					{displayArticles.map((article) => {
						const isBookmarked = !!bookmarks[article.id];
						return (
							<article key={article.id} className="article-card group">
								<div className="card-media-wrapper">
									<img
										src={article.image}
										alt={article.title}
										className="card-img"
									/>
									<div className="gradient-scrim" />
									<span className="category-pill">{article.category}</span>
									<button
										type="button"
										className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
										aria-label="Bookmark"
										onClick={(e) => handleBookmarkToggle(article.id, e)}
									>
										<span
											className="material-symbols-outlined"
											style={isBookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
										>
											bookmark
										</span>
									</button>
								</div>

								<div className="card-body">
									<div className="text-content">
										<Link href={`/community/detail?id=${article.id}`}>
											<h3 className="card-title">{article.title}</h3>
										</Link>
										<p className="card-excerpt">{article.excerpt}</p>
									</div>

									<div className="card-footer-meta">
										<span className="meta-left">
											{article.date} · {article.readTime}
										</span>
										<div className="meta-stats">
											<span className="stat-item">
												<span className="material-symbols-outlined">favorite</span>
												{article.likes}
											</span>
											<span className="stat-item">
												<span className="material-symbols-outlined">visibility</span>
												{article.views}
											</span>
										</div>
									</div>
								</div>
							</article>
						);
					})}
				</div>
			) : (
				/* Empty State Markup Block */
				<div className="articles-empty-card" id="articles-empty">
					<div className="empty-icon-box">
						<span className="material-symbols-outlined">menu_book</span>
					</div>
					<h3>No articles published yet</h3>
					<p>
						{memberName} has not released any public dispatches or photo monographs yet. Check back
						soon for new expeditions.
					</p>
				</div>
			)}

			{/* Minimalist Pagination */}
			<div className="pagination-wrapper">
				<span className="pagination-info">Showing 1–9 of 18 articles</span>
				<div className="pagination-pills">
					<button
						type="button"
						className="nav-arrow-btn"
						aria-label="Previous page"
						disabled={page === 1}
						onClick={() => setPage(1)}
					>
						<span className="material-symbols-outlined">chevron_left</span>
					</button>

					<button
						type="button"
						className={`page-num-btn ${page === 1 ? 'active' : ''}`}
						onClick={() => setPage(1)}
					>
						1
					</button>

					<button
						type="button"
						className={`page-num-btn ${page === 2 ? 'active' : ''}`}
						onClick={() => setPage(2)}
					>
						2
					</button>

					<button
						type="button"
						className="nav-arrow-btn"
						aria-label="Next page"
						onClick={() => setPage(2)}
					>
						<span className="material-symbols-outlined">chevron_right</span>
					</button>
				</div>
			</div>
		</main>
	);
};

export default MemberArticles;
