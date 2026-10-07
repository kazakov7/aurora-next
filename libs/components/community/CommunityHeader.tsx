import React, { useState, useRef, useEffect } from 'react';

interface CommunityHeaderProps {
	currentSort: string;
	onSortChange: (sort: string) => void;
	onOpenWriteModal: () => void;
}

const CommunityHeader: React.FC<CommunityHeaderProps> = ({
	currentSort,
	onSortChange,
	onOpenWriteModal,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const sortOptions = [
		{ label: 'Trending', value: 'Trending' },
		{ label: 'Latest', value: 'Latest' },
		{ label: 'Top Rated', value: 'Top Rated' },
	];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleSelect = (val: string) => {
		onSortChange(val);
		setIsOpen(false);
	};

	return (
		<header className="community-header">
			<div className="header-top-row">
				<div className="header-title-box">
					<div className="dispatch-badge">
						<span className="material-symbols-outlined icon">public</span>
						<span>Global Dispatch</span>
					</div>
					<h1 className="main-title">Travelers Community</h1>
					<p className="subtitle">
						Stories, itineraries, and insider dispatches from verified explorers and world-class hosts across six continents.
					</p>
				</div>

				<div className="header-actions">
					{/* Sort dropdown */}
					<div className="sort-dropdown-container" ref={dropdownRef}>
						<button
							className="sort-trigger-btn"
							type="button"
							onClick={() => setIsOpen(!isOpen)}
						>
							<span className="material-symbols-outlined sort-icon">swap_vert</span>
							<span className="sort-label">{currentSort}</span>
							<span className="material-symbols-outlined chevron-icon">expand_more</span>
						</button>

						{isOpen && (
							<div className="sort-menu-card">
								{sortOptions.map((opt) => (
									<button
										key={opt.value}
										className={`sort-menu-item ${currentSort === opt.value ? 'active' : ''}`}
										type="button"
										onClick={() => handleSelect(opt.value)}
									>
										<span>{opt.label}</span>
										{currentSort === opt.value && (
											<span className="material-symbols-outlined check-icon">check</span>
										)}
									</button>
								))}
							</div>
						)}
					</div>

					{/* Write Story Button */}
					<button
						className="write-story-btn"
						type="button"
						onClick={onOpenWriteModal}
					>
						<span className="material-symbols-outlined edit-icon">edit_note</span>
						<span>Write Story</span>
					</button>
				</div>
			</div>
		</header>
	);
};

export default CommunityHeader;
