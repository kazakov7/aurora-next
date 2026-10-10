import React, { useState } from 'react';
import { useI18n } from '../../i18n';

interface FollowButtonProps {
	isFollowing: boolean;
	isLoading?: boolean;
	onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
	size?: 'sm' | 'md';
	className?: string;
	style?: React.CSSProperties;
}

const FollowButton: React.FC<FollowButtonProps> = ({
	isFollowing,
	isLoading = false,
	onClick,
	size = 'md',
	className = '',
	style
}) => {
	const { t } = useI18n();
	const [isHovered, setIsHovered] = useState(false);

	const getIcon = () => {
		if (isLoading) return 'sync';
		if (size === 'sm') {
			if (isFollowing && isHovered) return 'close'; // unfollow icon for sm
			if (isFollowing) return 'check';
			return 'add';
		}
		if (isFollowing && isHovered) return 'person_remove';
		if (isFollowing) return 'how_to_reg';
		return 'person_add';
	};

	const getText = () => {
		if (isLoading) return t('common.updating');
		if (isFollowing && isHovered) return t('common.unfollow');
		if (isFollowing) return t('common.followButton.following');
		return t('common.follow');
	};

	return (
		<button
			type="button"
			className={`btn-follow-standard size-${size} ${isFollowing ? 'following' : ''} ${className}`}
			onClick={(e) => {
				e.stopPropagation();
				onClick(e);
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			disabled={isLoading}
			style={style}
		>
			<span className="material-symbols-outlined" style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }}>
				{getIcon()}
			</span>
			<span>{getText()}</span>
		</button>
	);
};

export default FollowButton;
