import React from 'react';

interface SaveButtonProps {
	isSaved: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	count?: number;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	style?: React.CSSProperties;
}

const SaveButton: React.FC<SaveButtonProps> = ({ 
	isSaved, 
	onClick, 
	count, 
	size = 'md', 
	className = '',
	style
}) => {
	return (
		<button
			type="button"
			aria-label={isSaved ? "Unsave" : "Save"}
			className={`btn-save-standard size-${size} ${isSaved ? 'saved' : ''} ${className}`}
			onClick={(e) => {
				e.stopPropagation();
				onClick(e);
			}}
			style={style}
		>
			<span className="material-symbols-outlined">
				{isSaved ? 'bookmark' : 'bookmark_border'}
			</span>
			{count !== undefined && <span className="save-count">{count.toLocaleString()}</span>}
		</button>
	);
};

export default SaveButton;
