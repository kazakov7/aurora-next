import React from 'react';
import { useI18n } from '../../i18n';

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
	const { t, formatNumber } = useI18n();
	const computedStyle = { ...style };
	if (isLiked) {
		delete computedStyle.backgroundColor;
	}

	return (
		<button
			type="button"
			aria-label={isLiked ? t('common.unlike') : t('common.like')}
			className={`btn-like-standard size-${size} ${isLiked ? 'liked' : ''} ${className}`}
			onClick={(e) => {
				e.stopPropagation();
				onClick(e);
			}}
			style={computedStyle}
		>
			<span className="material-symbols-outlined">favorite</span>
			{count !== undefined && <span className="like-count">{formatNumber(count)}</span>}
		</button>
	);
};

export default LikeButton;
