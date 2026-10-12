import React from 'react';
import { BoardArticle } from '../../../types/board-article/board-article';
import { useI18n } from '../../../i18n';

interface CommunityDetailBodyProps {
	article: BoardArticle;
}

const CommunityDetailBody: React.FC<CommunityDetailBodyProps> = ({ article }) => {
	const { t } = useI18n();
	const content = article?.articleContent || '';

	return (
		<article className="community-detail-body-article">
			{content ? (
				// The story is plain text: React escapes it, and pre-line keeps the author's line breaks
				<div className="story-section story-text">{content}</div>
			) : (
				<p className="body-paragraph" style={{ textAlign: 'center', color: 'var(--outline)' }}>
					{t('community.detailBody.noContent')}
				</p>
			)}
		</article>
	);
};

export default CommunityDetailBody;
