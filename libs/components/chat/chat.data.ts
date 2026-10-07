import { ChatConversation } from './chat.types';

export const initialConversations: ChatConversation[] = [
	{
		id: 'global',
		name: 'Global Chat',
		icon: 'public',
		role: 'global',
		roleBadge: 'Community Lounge',
		subtitle: 'Community Lounge',
		lastMessage: 'Aria: The mist over Kyoto this morning was surreal...',
		lastTime: '10:14 am',
		unreadCount: 12,
		messages: [
			{
				id: 'gm1',
				senderId: 'aria',
				senderName: 'Aria',
				senderAvatar: '',
				text: 'The mist over Kyoto this morning was surreal... recommend early walk near Arashiyama bamboo grove.',
				time: '10:14 am',
			},
		],
	},

	{
		id: 'julian',
		name: 'Julian Laurent',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuBS1p5NTzvMvtjfPwfzvrxe4vggTDOQjQRDoDJIj8rTGb7Ffn98ROoUvmiq-fLzQoe3rI87t1OpUfya8bywGhycMtL31a-VCXvHL55zwx3TilaG0iEuK-jxV-wOv653BGlVeI1GgJCZbcr-p-Z7TjSAnvIhJ4flfX2X6FLGBvBaUsIeiIqelJBiZABpf9RYK9ZGI7x3WIDV-VNLRgDm84-ZeIdDrHnwCFJ6HiQjN6Hr7iLx68239qlE',
		isOnline: true,
		role: 'partner',
		roleBadge: 'Verified GM',
		subtitle: 'Hotel Partner · Aman Kyoto',
		lastMessage: 'Yes, the Alpine Suite is confirmed for your...',
		lastTime: '2:45 pm',
		verified: true,
		location: 'Geneva, CH & Kyoto, JP',
		bio: 'Architectural curator & hospitality director pairing Japanese master craftsmanship with serene Alpine reductionism.',
		messages: [
			{
				id: 'm1',
				senderId: 'julian',
				senderName: 'Julian Laurent',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuAF4sHKBfJDZEs0NR5HB029qYitHkRGL92uMAcDZfPxnXJZPxzQsNWJxRT5waxX3WbauFpgNEkbOZv4o45L9jz1B9tYZP_pW1zg4XZwV3hZw7TTWEpzhQAVTr1QNX__4J1hUZGaM_j0075n9nUS-xTevu1HdBPpUoUTcvvni-g6ygaecTulAY6BtpBmlTowwM3muHBZzLv5iLOslr_D9_vvH-2fBEoo-9pLLWEp3Km9ceSFo64Qil4k',
				text: 'Bonjour Elena! Delighted to welcome you back to Kyoto. Regarding your inquiry about the private garden pavilion for November 14–18, we have reserved the Forest Terrace Suite with morning cedar bath access.',
				time: '2:32 pm',
			},
			{
				id: 'm2',
				senderId: 'me',
				senderName: 'Elena Rostova',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuDQzVRKp7lfd8XGtJsOnedswVg26UIs-0VBB2iOqfrZXuqq5XaEtWT-a4SPvkAS87kGZh3YvPnTAd4qxCrHzw3k6ZnNVQmYvk8nsJOc_nnbImal1rB-WHdznXOZi2Wgpgf8qSN8jc5w6sAiUsSWB6X097mWEGNHQyr4O2f7YTljk_u7qvP62Gj9otoiMkzZHCl4XC67QuAAkIWcQb7BQyjrfAYECjwEB4i-7Co6iC-HjCKul_6wMBlJ',
				text: 'Wonderful news, Julian! Could we also arrange the sunrise tea ceremony with the resident master on the morning of the 16th?',
				time: '2:38 pm',
				isOutgoing: true,
			},
			{
				id: 'm3',
				senderId: 'julian',
				senderName: 'Julian Laurent',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuBbiUblWHkRikfY5MCExOLxGOK_8nDnssV1Ws4BDIV5Fc7pzk3rpUPEfk7A5S1dJ4iLbHkHHmhprynWuttDI6MeZWJEK107FnXfm43CAtYhre3o9H4OpYOcFfSfRL2FoGeG6M4Jzz7aeWntpEQbONfO3o_Xflix5Vo75q57zIPXGJal7wqfCrqwNJjVmLfe225CnvcEkGCzwXiOZrsxjP935oD5DjIf5_bl9XX0qZOAzax5lewEwPMW',
				text: "Absolutely. I have coordinated with Master Morioka for 06:30 am. I've attached the customized itinerary and the quiet garden map below.",
				time: '2:41 pm',
				attachment: {
					fileName: 'Kyoto_Autumn_Sanctuary_Itinerary.pdf',
					fileSize: '1.8 MB · Verified Document',
					fileType: 'pdf',
				},
			},
			{
				id: 'm4',
				senderId: 'julian',
				senderName: 'Julian Laurent',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuBX0iS9qNxOOkdTS1JUkjifZJQhp6ZBor5KfFOPsdUBl1v1ZgT3OLn8mlF9fIaIApwpgBtcaZ6C9pZkTI81jFd-4A-SVd4OpcowU0hNN1ouU4tMXrDvsZFobmQEKhl5YiA51VOEDlk2rLnJrzo8L0N9m41FNFq0k5GQj-Mya3zuMb-0uMtrFfTH-Z1EKWkyiGDG_r3L7B8JeOcVyu3elIPyrlfKbd0tcSKgwlEDsJ5z21Ue5_YHueqW',
				text: 'Our private chauffeured electric hybrid will greet you directly at Kansai Airport arrivals. Looking forward to your arrival!',
				time: '2:45 pm',
			},
		],
		properties: [
			{
				id: 'prop-1',
				title: 'Aman Kyoto Forest Villa',
				location: 'Kyoto, Japan',
				price: '$1,150',
				rating: 4.99,
				image:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuCqu_BvJ02DIceh18tb0BrbN7Wv9vA7qIjrQmN8AgdASpXUaQoEgST2RlIhjVgWnTKrIpTW7mFHq2Ib00q0trHRrRZj91H8-tn_aQ68lbapbEwNPr7B_4XI-RZZ8O4EllNDpdI82vCgc3eNOImJhAGLVsNiHkRxPR8T9tZ4lj7Eh9muS3K3gXzVZJkqtic6ePUB1ibu9HJaK-Xfj2MQHaaNcOz6uu6rhEVWgPWdUsVg9Q1BbAT7TVO8',
			},
			{
				id: 'prop-2',
				title: 'The Glass House Chalet',
				location: 'Valais, Switzerland',
				price: '$680',
				rating: 4.98,
				image:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuDV_lufAuGOmkRJKW2e6RkY8IDVJ5cbHhfR0K1AqLdqgQjQxe8qE89_UVh4H7WvbSkqshlLOvyLmxZZZzUlGt7brMIaIikEnEZj7jxZdz6KcSGccSpPa26N92lyIUNzHxiLDEEJvZonxn2a762_dy4YB1FR54rJqOXA_vPt-8wLrGzkTYxA6AxDSiRSjycme_l0QR5XU0ljLhsgeUJqHeLZHwEKT4xIaZFNSMi_sbZ2Ao6Nxp_6AI9w',
			},
		],
		sharedFiles: [
			{
				id: 'f1',
				fileName: 'Kyoto_Terrace_Blueprint.pdf',
				fileSize: '4.2 MB',
				type: 'pdf',
			},
			{
				id: 'f2',
				fileName: 'Garden_Morning_View.heic',
				fileSize: '12 MB',
				type: 'image',
			},
		],
	},
	{
		id: 'elena',
		name: 'Elena Rostova',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuDQzVRKp7lfd8XGtJsOnedswVg26UIs-0VBB2iOqfrZXuqq5XaEtWT-a4SPvkAS87kGZh3YvPnTAd4qxCrHzw3k6ZnNVQmYvk8nsJOc_nnbImal1rB-WHdznXOZi2Wgpgf8qSN8jc5w6sAiUsSWB6X097mWEGNHQyr4O2f7YTljk_u7qvP62Gj9otoiMkzZHCl4XC67QuAAkIWcQb7BQyjrfAYECjwEB4i-7Co6iC-HjCKul_6wMBlJ',
		isOnline: true,
		role: 'traveler',
		roleBadge: 'Verified Explorer',
		subtitle: 'Verified Explorer',
		lastMessage: 'The hiking permit for Valais came through!',
		lastTime: '1:20 pm',
		unreadCount: 2,
		verified: true,
		location: 'Valais, Switzerland',
		bio: 'Documenting high alpine routes, architectural retreats, and remote coastlines across 42 countries.',
		messages: [
			{
				id: 'em1',
				senderId: 'elena',
				senderName: 'Elena Rostova',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuDQzVRKp7lfd8XGtJsOnedswVg26UIs-0VBB2iOqfrZXuqq5XaEtWT-a4SPvkAS87kGZh3YvPnTAd4qxCrHzw3k6ZnNVQmYvk8nsJOc_nnbImal1rB-WHdznXOZi2Wgpgf8qSN8jc5w6sAiUsSWB6X097mWEGNHQyr4O2f7YTljk_u7qvP62Gj9otoiMkzZHCl4XC67QuAAkIWcQb7BQyjrfAYECjwEB4i-7Co6iC-HjCKul_6wMBlJ',
				text: 'The hiking permit for Valais came through! Ready for tomorrow morning.',
				time: '1:20 pm',
			},
		],
	},
	{
		id: 'svart',
		name: 'Svart Glacier Lodge',
		icon: 'villa',
		role: 'partner',
		roleBadge: 'Arctic Sanctuary',
		subtitle: 'Arctic Circle Sanctuary',
		lastMessage: "We've scheduled the fjord boat transfer.",
		lastTime: 'Yesterday',
		verified: true,
		location: 'Meløy, Norway',
		bio: 'Zero-emission off-grid sanctuary nestled at the foot of Svartisen glacier.',
		messages: [
			{
				id: 'sm1',
				senderId: 'svart',
				senderName: 'Svart Glacier Lodge',
				senderAvatar: '',
				text: "We've scheduled the fjord boat transfer for your arrival on Friday evening.",
				time: 'Yesterday',
			},
		],
	},
	{
		id: 'freja',
		name: 'Freja Lindqvist',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuB5EA3jZH1OlNgjy7ZoTB-Yft5QRHtwgrLzJa6tENkvJSqjPL1KM8NmjLjIC1498XwLwVKGvq0bKa6Vys3XLSfDhqy1lS16tPS9Bfjz5NMOPyrj40CpN5Os7dln_EjEvobk07yN_jmvz56PYviLz6GNHAuZv9ubHZJULfILXl15BmpnnJuju_5RLEoVp6UlUA1EMVrrNGYwwEhqjPNYtxQi8Q79XilIP5J7nsyDlc7DaEaBT8GDutXS',
		role: 'traveler',
		roleBadge: 'Sanctuary Traveler',
		subtitle: 'Sanctuary Traveler',
		lastMessage: 'Do you recommend 3 or 4 days in Tromsø?',
		lastTime: 'Wed',
		location: 'Stockholm, Sweden',
		bio: 'Scandinavian design enthusiast seeking northern lights and remote wilderness saunas.',
		messages: [
			{
				id: 'fm1',
				senderId: 'freja',
				senderName: 'Freja Lindqvist',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuB5EA3jZH1OlNgjy7ZoTB-Yft5QRHtwgrLzJa6tENkvJSqjPL1KM8NmjLjIC1498XwLwVKGvq0bKa6Vys3XLSfDhqy1lS16tPS9Bfjz5NMOPyrj40CpN5Os7dln_EjEvobk07yN_jmvz56PYviLz6GNHAuZv9ubHZJULfILXl15BmpnnJuju_5RLEoVp6UlUA1EMVrrNGYwwEhqjPNYtxQi8Q79XilIP5J7nsyDlc7DaEaBT8GDutXS',
				text: 'Do you recommend 3 or 4 days in Tromsø for peak aurora viewing?',
				time: 'Wed',
			},
		],
	},
	{
		id: 'natgeo',
		name: 'NatGeo Expeditions',
		icon: 'explore',
		role: 'partner',
		roleBadge: 'Charter Partner',
		subtitle: 'Charter Partner',
		lastMessage: 'Special departure dates for Patagonia 2025.',
		lastTime: 'Oct 12',
		verified: true,
		location: 'Patagonia, Chile',
		bio: 'Pioneering scientific expeditions and expert-led photography charters around the globe.',
		messages: [
			{
				id: 'nm1',
				senderId: 'natgeo',
				senderName: 'NatGeo Expeditions',
				senderAvatar: '',
				text: 'Special departure dates for Patagonia 2025 are now open exclusively for AURA members.',
				time: 'Oct 12',
			},
		],
	},
	{
		id: 'kenji',
		name: 'Kenji Sato',
		avatar:
			'https://lh3.googleusercontent.com/aida-public/AB6AXuAXDGJVQTtdpgwaxjYFxotrUqBcSIy6likMMCmyxuF4icEmjUR1z6zLbdZ5WsI4V5ey7N6Cw5pntr5TZVgqf9EuFKguZJLIZ0BeAOr7bAGdloVSyNs21fM7nPmdtwaeZDMS8mgWq3IBKPi6uLOfUp-ZurqK5icOQtijmxplZkfDnV3IjjkzvssuT_d5zz2aCgvJISeziEz05rITNszMEW7PIH_RwY3ppP2WBzEMrSwIgn_1phVWXhyK',
		role: 'traveler',
		roleBadge: 'Design Scholar',
		subtitle: 'Design Scholar',
		lastMessage: 'Shared the Ryokan architectural notes.',
		lastTime: 'Sep 28',
		location: 'Kyoto, Japan',
		bio: 'Research fellow studying traditional Japanese woodwork and bioclimatic vernacular architecture.',
		messages: [
			{
				id: 'km1',
				senderId: 'kenji',
				senderName: 'Kenji Sato',
				senderAvatar:
					'https://lh3.googleusercontent.com/aida-public/AB6AXuAXDGJVQTtdpgwaxjYFxotrUqBcSIy6likMMCmyxuF4icEmjUR1z6zLbdZ5WsI4V5ey7N6Cw5pntr5TZVgqf9EuFKguZJLIZ0BeAOr7bAGdloVSyNs21fM7nPmdtwaeZDMS8mgWq3IBKPi6uLOfUp-ZurqK5icOQtijmxplZkfDnV3IjjkzvssuT_d5zz2aCgvJISeziEz05rITNszMEW7PIH_RwY3ppP2WBzEMrSwIgn_1phVWXhyK',
				text: 'Shared the Ryokan architectural notes and timber framing drawings for your review.',
				time: 'Sep 28',
			},
		],
	},
];
