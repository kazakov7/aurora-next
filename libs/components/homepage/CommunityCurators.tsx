import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useReactiveVar } from '@apollo/client';
import { GET_BOARD_ARTICLES } from '../../../apollo/user/query';
import { SUBSCRIBE, UNSUBSCRIBE } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { Direction, Message } from '../../enums/common.enum';
import { T } from '../../types/common';
import { getImageUrl } from '../../config';
import { sweetTopSmallSuccessAlert, sweetMixinErrorAlert } from '../../sweetAlert';

interface Curator {
	_id: string;
	name: string;
	role: string;
	itineraries: number;
	avatar: string;
	isFollowing?: boolean;
}

const defaultCurators: Curator[] = [
	{
		_id: 'default-curator-1',
		name: 'Elena Rostova',
		role: 'Subarctic Explorer',
		itineraries: 18,
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDrFrVWXBRbW7-r9zNa2IedkP_g1w3jNk78MBFUAc0avAIwmw0COLS5o_mcBeZpisu7O6MvASQpDpMDLsPXiUBGmL3_yyXx2qwntRJUIqM97Yw81_Z-o3ljoY8Df12Fy0KoRWsRHAdvJsG9EPinaLIdT2pEVIgQXd2lFcGtGrojpwZVoLLWO-Ganb9mcuxADBNwLykh4Tu2_NVBIJC7QuytwGyM67kxI_tnQCb_8Yg',
	},
	{
		_id: 'default-curator-2',
		name: 'Marcus Chen',
		role: 'High-Altitude Guide',
		itineraries: 24,
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAj4p_frOv3azciTBWESD537EWkGlNUn35CB19Lc47B_NPQSovOz0OU9trvGCS8x9j8Nl8hce1JUtqrFQKPC99irdAeJ-RW9C52zlb6HiQNjLJqOk8sLQsyR5a1mPQ6oXvlsFeIMfC8TB1Aji_OGPByDUon2UH96rot86_twHZHFfHHKuGfRw7XRbczAY7J64oMkULtmOp21WfPhnWf2yGWfDcd6t9LB4Mwa3sgEkg',
	},
	{
		_id: 'default-curator-3',
		name: 'Sarah Jenkins',
		role: 'Architecture Critic',
		itineraries: 31,
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YDCPWDZOwrtfpcwdAr22MwfciWBGGNHlfI_lioenR2QDxiNTOmjdBypIkTdMX86BaxU9IlCfBRSHEWUV7xu2tJzWK6TSr4148F2qCPAcwuDoZHdKbyDwhzugSMFImsFOU1Hro3gM5mdRLR-cZGyD_wvZi0G7VsS3Ad1_KgADmFZ19GNTBIQnUnQFn4VB3Op2BNq4WwTvYyddVIlA9xXst7TxdQMXSTeBCnaT1BM',
	},
	{
		_id: 'default-curator-4',
		name: "Liam O'Connor",
		role: 'Wildlife Biologist',
		itineraries: 12,
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuA776NvviO7o1kUIA8-VGfko9mcwpjIzdyY-bxpGB2HVaqe_qZR5LzEiMf7iJsQgutt1lLmcWe06oKcaRqsa091l6K-dUDdVEIDraIyygP8HTD5fu2w7f8RYjjrK5yYQ95RHsCHpuukmx-UqVZLYHADdf0kUcENWAE8Ol7f6_fYpxULBVrgnRVXxQ8fkjzroFwjFQQ2ISr2MAPSRIdnKkkviiOywQj9HgbCNmDVQ68',
	},
];

const CommunityCurators = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [curators, setCurators] = useState<Curator[]>([]);
	const [followingIds, setFollowingIds] = useState<Record<string, boolean>>({});

	/** APOLLO REQUESTS **/
	const [subscribe] = useMutation(SUBSCRIBE);
	const [unsubscribe] = useMutation(UNSUBSCRIBE);

	const { data, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: {
			input: {
				page: 1,
				limit: 10,
				sort: 'articleViews',
				direction: Direction.DESC,
				search: {},
			},
		},
		notifyOnNetworkStatusChange: true,
	});

	/** LIFECYCLES **/
	useEffect(() => {
		const list = data?.getBoardArticles?.list;
		if (list && list.length > 0) {
			const uniqueMembers = new Map<string, Curator>();
			list.forEach((article: any) => {
				const m = article.memberData;
				if (m && m._id && !uniqueMembers.has(m._id)) {
					uniqueMembers.set(m._id, {
						_id: m._id,
						name: m.memberFullName || m.memberNick || 'Verified Curator',
						role: 'Verified Expedition Curator',
						itineraries: 15,
						avatar: getImageUrl(m.memberImage, defaultCurators[0].avatar),
					});
				}
			});
			if (uniqueMembers.size > 0) {
				setCurators(Array.from(uniqueMembers.values()));
			}
		}
	}, [data]);

	/** HANDLERS **/
	const followHandler = async (curatorId: string) => {
		try {
			if (!user?._id) throw new Error(Message.NOT_AUTHENTICATED);
			const isFollowing = followingIds[curatorId];
			if (isFollowing) {
				await unsubscribe({ variables: { input: curatorId } });
				setFollowingIds((prev) => ({ ...prev, [curatorId]: false }));
				await sweetTopSmallSuccessAlert('Unfollowed curator', 800);
			} else {
				await subscribe({ variables: { input: curatorId } });
				setFollowingIds((prev) => ({ ...prev, [curatorId]: true }));
				await sweetTopSmallSuccessAlert('Curator followed!', 800);
			}
		} catch (err: any) {
			console.log('ERROR, followHandler:', err.message);
			sweetMixinErrorAlert(err.message);
		}
	};

	const displayCurators = Array.from({ length: 4 }).map((_, index) => {
		if (curators[index]) return curators[index];
		return defaultCurators[index];
	});

	return (
		<section className="curators-section">
			<div className="section-container">
				<div className="section-header">
					<div>
						<span className="section-tag">Community Curators</span>
						<h2 className="section-title">Meet the Explorers</h2>
						<p className="section-subtitle">
							Follow verified curators sharing rare itineraries and quiet gems.
						</p>
					</div>
				</div>

				<div className="curators-grid">
					{displayCurators.map((curator, idx) => {
						const isFollowing = followingIds[curator._id];

						return (
							<div key={curator._id || idx} className="curator-card">
								<img
									src={curator.avatar}
									alt={curator.name}
									className="curator-avatar"
									onError={(e: any) => {
										e.target.src = defaultCurators[idx % defaultCurators.length].avatar;
									}}
								/>
								<div className="curator-info">
									<div className="curator-name-row">
										<h3 className="curator-name">{curator.name}</h3>
										<span
											className="material-symbols-outlined verified-icon"
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											verified
										</span>
									</div>
									<p className="curator-role">{curator.role}</p>
									<span className="curator-itineraries">
										{curator.itineraries} Curations
									</span>
								</div>
								<button
									className={`follow-btn ${isFollowing ? 'following' : ''}`}
									type="button"
									onClick={() => followHandler(curator._id)}
								>
									{isFollowing ? 'Following' : 'Follow'}
								</button>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
};

export default CommunityCurators;
