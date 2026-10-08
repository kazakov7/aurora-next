import React from 'react';

interface LikeButtonProps {
	isLiked: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	count?: number;
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	style?: React.CSSProperties;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
	isLiked, 
	onClick, 
	count, 
	size = 'md', 
	className = '',
	style
}) => {
	const computedStyle = { ...style };
	if (isLiked) {
		delete computedStyle.backgroundColor;
	}

	return (
		<button
			type="button"
			aria-label={isLiked ? "Unlike" : "Like"}
			className={`btn-like-standard size-${size} ${isLiked ? 'liked' : ''} ${className}`}
			onClick={(e) => {
				e.stopPropagation();
				onClick(e);
			}}
			style={computedStyle}
		>
			<span className="material-symbols-outlined">favorite</span>
			{count !== undefined && <span className="like-count">{count.toLocaleString()}</span>}
		</button>
	);
};

export default LikeButton;
