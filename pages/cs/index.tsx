import React, { useState } from 'react';
import { NextPage } from 'next';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CsContactForm from '../../libs/components/cs/CsContactForm';

const CS: NextPage = () => {
	const device = useDeviceDetect();
	const [searchQuery, setSearchQuery] = useState<string>('');

	/** HANDLERS **/
	const handleSearchTrigger = () => {
		if (!searchQuery.trim()) return;
		const faqSection = document.getElementById('faq');
		if (faqSection) {
			faqSection.scrollIntoView({ behavior: 'smooth' });
		}
	};

	if (device === 'mobile') {
		return <h1>CS PAGE MOBILE</h1>;
	} else {
		return (
			<div id="pc-wrap">
				<div className="cs-page">
					{/* HERO SECTION */}
					<section className="hero-section">
						<div className="hero-bg" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AEtjO1V5YkJrjFIoa8V_NOprDw7wdWsa-LZQkYhgCrD4Je0raUdF05gAi113qTs2S36WViyWC4KlAI2GRz8nvgo0uuSE_eZTt9WypPO9AThqnkyfSIdImcmLQ9f_BH-gSOz4S9-s0f6Iy5QfQKPHa4z6IzbjgsrNkVqh-YQUvn0JUwpCJAuCYKYuGuT0KI3P1DiS0gefpIjjuucAjjg5C_c6vfZF4LENVjvM67aFv1No0CWhuIdj4A-I-1j7WBg')" }}></div>
						<div className="hero-overlay"></div>
						<div className="hero-content">
							<div className="concierge-badge">
								<span className="pulse-dot"></span>
								<span className="badge-text">AURA Concierge & Support</span>
							</div>
							<h1 className="hero-title">How can we help you?</h1>
							<p className="hero-subtitle">Find answers, manage bespoke itineraries, and return to seamless exploration.</p>
							
							<div className="search-container">
								<div className="search-input-box">
									<span className="material-symbols-outlined search-icon">search</span>
									<input 
										type="text" 
										placeholder="Search for help, bookings, cancellations, vouchers..."
										value={searchQuery}
										onChange={(e) => setSearchQuery(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && handleSearchTrigger()}
									/>
									<button className="search-btn" onClick={handleSearchTrigger} type="button">Find Answers</button>
								</div>
								<div className="quick-prompts">
									<span className="prompt-label">Quick prompts:</span>
									<button onClick={() => setSearchQuery('Cancellation policy')} type="button">Cancellation policy</button>
									<button onClick={() => setSearchQuery('Refund timeline')} type="button">Refund timeline</button>
									<button onClick={() => setSearchQuery('Modify dates')} type="button">Modify dates</button>
									<button onClick={() => setSearchQuery('Bespoke charter inquiry')} type="button">Bespoke charter inquiry</button>
								</div>
							</div>
						</div>
					</section>

					<div className="content-wrapper">
						{/* TOPICS SECTION */}
						<section className="topics-section">
							<div className="section-header">
								<div className="header-left">
									<span className="section-eyebrow">Knowledge Repository</span>
									<h2 className="section-title">Browse by Topic</h2>
									<p className="section-desc">Select an area to explore detailed operational guides, charter standards, and self-service tools.</p>
								</div>
								<div className="header-right">
									<span className="dot"></span>
									<span>Updated across all territories</span>
								</div>
							</div>
							
							<div className="topics-grid">
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">calendar_month</span></div>
										<h3>Bookings & Reservations</h3>
										<p>Manage active itineraries, date changes, guest assignments, and instant confirmation vouchers.</p>
									</div>
									<div className="card-footer">
										<span>Explore 14 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
								
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">apartment</span></div>
										<h3>Hotels & Stays</h3>
										<p>Check-in protocols, sanctuary amenities, discrete host correspondence, and private key handoffs.</p>
									</div>
									<div className="card-footer">
										<span>Explore 19 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
								
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">explore</span></div>
										<h3>Tours & Experiences</h3>
										<p>Expedition briefings, private guides, specialized mountaineering gear requirements, and weather alerts.</p>
									</div>
									<div className="card-footer">
										<span>Explore 12 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
								
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">account_balance_wallet</span></div>
										<h3>Payments & Refunds</h3>
										<p>Discreet billing, multi-currency escrow security, and transparent real-time settlement timelines.</p>
									</div>
									<div className="card-footer">
										<span>Explore 16 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
								
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">shield</span></div>
										<h3>Account & Security</h3>
										<p>Two-factor hardware authentication, privacy directives, and encrypted passport credential storage.</p>
									</div>
									<div className="card-footer">
										<span>Explore 9 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
								
								<a href="#faq" className="topic-card group">
									<div className="card-glow"></div>
									<div className="card-content">
										<div className="icon-box"><span className="material-symbols-outlined">support_agent</span></div>
										<h3>Safety & Support</h3>
										<p>Emergency airside assistance, high-altitude medical directives, evacuation protocols, and charter insurance.</p>
									</div>
									<div className="card-footer">
										<span>Explore 11 guides</span>
										<span className="material-symbols-outlined">arrow_forward</span>
									</div>
								</a>
							</div>
						</section>

						{/* FAQ SECTION */}
						<section id="faq" className="faq-section">
							<div className="section-header-simple">
								<span className="section-eyebrow">Instant Knowledge</span>
								<h2 className="section-title">Frequently Asked Questions</h2>
								<p className="section-desc">Instant resolutions to our travelers’ most common operational inquiries.</p>
							</div>
							
							<div className="faq-container">
								<details className="faq-item" open>
									<summary>
										<span>How do I make a hotel reservation?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Navigate to the <a href="#">Hotels & Sanctuaries</a> section, select your destination and travel dates, and browse our verified architectural portfolio. Each property features suite configurations, exact floor plans, and amenities. You can book instantly with our encrypted one-click escrow or request bespoke concierge arrangements for customized host requirements.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>How can I cancel my booking?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Cancellations are executed in seconds via <strong>My Page &gt; Bookings</strong>. Select your active stay or tour and click "Initiate Cancellation." Under our Flexible Sanctuary Tier, full escrow refunds are credited automatically if cancelled at least 48 hours prior to local check-in time. Any applicable refund is returned instantly to your primary payment method.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>Can I change my travel dates?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Yes. Date adjustments can be submitted seamlessly up to 72 hours before arrival, subject to partner availability. From your itinerary dashboard, select "Modify Dates." If there is a rate difference due to seasonal shifts, you will be prompted to approve the adjustment prior to cryptographic confirmation.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>How do I contact a hotel owner or expedition lead?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Once a booking is confirmed, direct end-to-end encrypted messaging unlocks via <a href="#">AURA Airside Chat</a>. You can correspond directly with property managers, villa concierges, or lead mountaineers for ground transfers, private chefs, and custom equipment sizing.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>How do I book a bespoke tour or private charter?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Access our <a href="#">Curated Expeditions</a> portfolio and choose the "Private Departure" toggle, or send custom coordinates directly to the Concierge Desk using the contact form below. Our alpine logistics team prepares complete flight, guide, and security schedules within 4 hours.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>Where can I find my booking details and receipts?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										All itinerary documents, tax invoices, and cryptographic boarding cards are stored indefinitely in <a href="#">My Page &gt; Bookings</a>. You can export authenticated PDF vouchers or generate Apple Wallet passes for off-grid access.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>How do I reset my password or update security credentials?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Visit <strong>My Page &gt; Settings &gt; Security Controls</strong>. Here, you can configure WebAuthn biometric passkeys, change master passwords, revoke concurrent session tokens, or adjust your public voyager display privacy.
									</div>
								</details>
								<details className="faq-item">
									<summary>
										<span>How can I report a problem during an active journey?</span>
										<span className="material-symbols-outlined">expand_more</span>
									</summary>
									<div className="faq-content">
										Active travelers have top-priority access. Tap the urgent "Airside Dispatch" icon in the navigation header, call our 24/7 dedicated line printed on your itinerary, or submit an urgent support ticket below. Ground liaison teams will intervene immediately.
									</div>
								</details>
							</div>
						</section>

						{/* CONTACT SUPPORT SECTION */}
						<section id="contact-form-section" className="contact-section">
							<div className="section-header-simple">
								<span className="section-eyebrow">Direct Assistance</span>
								<h2 className="section-title">Contact Support</h2>
								<p className="section-desc">Can't find what you're looking for? Send a dispatch directly to our concierge team.</p>
							</div>
							
							<div className="contact-grid">
								{/* Left Info Panel */}
								<div className="info-panel">
									<div className="info-card">
										<div className="card-glow"></div>
										<div className="badge">
											<span className="pulse-dot"></span>
											<span className="badge-text">Direct Support Desk</span>
										</div>
										<h3>Global Concierge Operations</h3>
										<p className="desc">Our dedicated travel concierges, dispatchers, and technical support specialists are stationed across Geneva, Tokyo, and New York.</p>
										
										<div className="response-time">
											<span className="material-symbols-outlined icon">schedule</span>
											<div className="text-box">
												<p className="title">Typical response time</p>
												<p className="subtitle">Under 15 minutes for verified members (24/7 worldwide airside coverage).</p>
											</div>
										</div>
										
										<div className="trust-highlights">
											<div className="highlight">
												<span className="material-symbols-outlined">enhanced_encryption</span>
												<span>End-to-end encrypted ticketing</span>
											</div>
											<div className="highlight">
												<span className="material-symbols-outlined">local_police</span>
												<span>Direct partner & host escalation</span>
											</div>
											<div className="highlight">
												<span className="material-symbols-outlined">translate</span>
												<span>Multilingual concierge team (DE, EN, FR, JP)</span>
											</div>
										</div>
									</div>
									
									<div className="inset-card">
										<div className="bg-img" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/AEtjO1VL_pfMx57PUv1LKuBs-d-fqGUY1ORiXOYT4H2lSxfvWQZgAG7GNWn3HickLRqsTPvq6IAGFfxfH-s7Gm5-RvxK9Aq2OPC6G_cV1QB8SJWTnezIuKP9bMufIhaqRi3U1R2juNaiOI58wUE-quySDgphyGCohQxhUttV-pJesnXBhC-Rwi31X5WNIo_wUHhbYHscCiliRg23FIY6pmUmMfIdugeUa_7QdkRhA-_80gXyS0OG1YS3p5r76_o')" }}></div>
										<div className="overlay"></div>
										<div className="inset-content">
											<div className="eyebrow">Geneva Base Dispatch</div>
											<div className="title">Alpine Emergency Coordinates Active</div>
										</div>
									</div>
								</div>
								
								{/* Right Form Panel */}
								<CsContactForm />
							</div>
						</section>

						{/* STILL NEED HELP CALLOUT */}
						<section className="help-callout">
							<div className="callout-text">
								<h3>Still need help?</h3>
								<p>Our global support collective is on standby around the clock to ensure flawless travel execution.</p>
							</div>
							<div className="callout-actions">
								<a href="#contact-form-section" className="action-btn primary">
									<span>Submit a Request</span>
									<span className="material-symbols-outlined">north_east</span>
								</a>
								<a href="#faq" className="action-btn secondary">View FAQs</a>
							</div>
						</section>
					</div>
				</div>
			</div>
		);
	}
};

export default withLayoutBasic(CS);
