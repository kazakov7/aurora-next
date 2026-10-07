import React from 'react';
import { BoardArticle } from '../../../types/board-article/board-article';

interface CommunityDetailBodyProps {
	article: BoardArticle;
}

const CommunityDetailBody: React.FC<CommunityDetailBodyProps> = ({ article }) => {
	const rawContent = article.articleContent || '';
	const paragraphs = rawContent.split('\n\n').filter((p) => p.trim().length > 0);

	return (
		<article className="community-detail-body-article">
			{/* Lead story introduction */}
			<div className="story-section">
				{paragraphs.length > 0 ? (
					paragraphs.map((para, idx) => (
						<p key={idx} className="body-paragraph">
							{para}
						</p>
					))
				) : (
					<p className="body-paragraph">
						Beyond the vibrant neon pulse of Seoul lies a tranquil realm of mist-shrouded peaks, secluded coastal tea terraces, and centuries-old wooden hanok sanctuaries. Traveling through South Korea offers an extraordinary balance of high-speed modern convenience and deeply preserved silence.
					</p>
				)}
			</div>

			{/* Curated Subsections */}
			<h2 className="section-heading">1. Mount Chiak Pagoda Sanctuary</h2>
			<p className="body-paragraph">
				Perched amidst the rugged ridges of Gangwon Province, Chiaksan National Park harbors ancient stone pagodas that rise majestically through dense morning mist. Autumn transforms these mountain flanks into an explosion of scarlet maples and ginkgo leaves, framing solitary timber temples where monks have maintained uninterrupted tea rituals for eight centuries.
			</p>
			<p className="body-paragraph">
				The trail leading to Mirook Peak demands steady endurance, but rewarded hikers encounter panoramic vistas extending across the Baekdudaegan mountain range. We recommend embarking before dawn to witness the first alpine rays pierce through the cloud inversions.
			</p>

			{/* Editorial Pull Quote */}
			<blockquote className="editorial-pull-quote">
				<p className="quote-text">
					"True sanctuary is not found in absolute seclusion, but in places where nature and architectural mindfulness exist in unbroken harmony."
				</p>
				<cite className="quote-author">— Elena Rostova, Aura Field Correspondent</cite>
			</blockquote>

			<h2 className="section-heading">2. Damyang Juknokwon Bamboo Grove</h2>
			<p className="body-paragraph">
				In Damyang, silence is defined not by the absence of sound, but by the hypnotic rustle of thousands of giant bamboo culms swaying gently against one another. As afternoon rain touches the leaves, negative ions and filtered emerald light envelop visitors in an all-encompassing sensory bath known locally as forest bathing.
			</p>
			<p className="body-paragraph">
				Eight curated trail pathways trace the natural contours of the mountain, intentionally constructed without sharp corners or commercial interruption to encourage unhurried contemplation and meditative pacing.
			</p>

			<h2 className="section-heading">3. Boseong Coastal Tea Terraces</h2>
			<p className="body-paragraph">
				Carved into green hillsides overlooking the southern sea, the Daehan Dawon tea plantation is a masterclass in agricultural geometry. Cedar-lined avenues give way to cascading rows of dark camellia sinensis bushes, yielding delicate green tea infused with coastal maritime breezes.
			</p>

			{/* Practical Tips Box */}
			<div className="practical-tips-box">
				<div className="tips-header">
					<span className="material-symbols-outlined icon">lightbulb</span>
					<span className="title">Explorer's Field Notes</span>
				</div>
				<ul className="tips-list">
					<li>
						<strong>Optimal Timing:</strong> Visit southern provinces between late September and mid-November for crisp dry weather and peak autumn foliage.
					</li>
					<li>
						<strong>Transit Insight:</strong> The KTX bullet train connects Seoul to Gwangju in just 1 hour 40 minutes; reserve a rental EV at the station for exploring rural valleys.
					</li>
					<li>
						<strong>Stays & Etiquette:</strong> Traditional Hanok stays require removing footwear at wooden verandas; pack lightweight wool socks for warm ondol floorboards.
					</li>
				</ul>
			</div>
		</article>
	);
};

export default CommunityDetailBody;
