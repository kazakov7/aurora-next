import React from 'react';
import { BoardArticle } from '../../../types/board-article/board-article';

interface CommunityDetailBodyProps {
	article: BoardArticle;
}

const CommunityDetailBody: React.FC<CommunityDetailBodyProps> = ({ article }) => {
	const content = article?.articleContent || '';

	return (
		<article className="community-detail-body-article">
			{content ? (
				<div 
					className="story-section quill-content" 
					dangerouslySetInnerHTML={{ __html: content }} 
				/>
			) : (
				<p className="body-paragraph" style={{ textAlign: 'center', color: 'var(--outline)' }}>
					No content available for this article.
				</p>
			)}
		</article>
	);
};

export default CommunityDetailBody;
