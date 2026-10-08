import re

with open("pages/mypage/index.tsx", "r") as f:
    content = f.read()

# 1. Add Agent components imports
content = content.replace(
    "import MyProfileSettings from '../../libs/components/mypage/MyProfileSettings';",
    "import MyProfileSettings from '../../libs/components/mypage/MyProfileSettings';\nimport MyHotels from '../../libs/components/mypage/agent/MyHotels';\nimport MyTours from '../../libs/components/mypage/agent/MyTours';\nimport Reservations from '../../libs/components/mypage/agent/Reservations';"
)

# 2. Add to allowedCategories
content = content.replace(
    "const allowedCategories = ['articles', 'followers', 'following', 'wishlist', 'bookings', 'history', 'notifications', 'settings'];",
    "const allowedCategories = ['articles', 'followers', 'following', 'wishlist', 'bookings', 'history', 'notifications', 'settings', 'myHotels', 'myTours', 'reservations'];"
)

# 3. Add to rendering logic
rendering_logic = """							{category === 'history' && <MyProfileHistory />}
							{category === 'notifications' && <MyProfileNotifications />}
							{category === 'settings' && <MyProfileSettings />}
							{category === 'myHotels' && <MyHotels />}
							{category === 'myTours' && <MyTours />}
							{category === 'reservations' && <Reservations />}"""
content = content.replace(
    "							{category === 'history' && <MyProfileHistory />}\n							{category === 'notifications' && <MyProfileNotifications />}\n							{category === 'settings' && <MyProfileSettings />}",
    rendering_logic
)

# 4. Add to getPageTitle
page_title_logic = """			case 'settings':
				return 'Settings — AURA Profile';
			case 'myHotels':
				return 'My Hotels — AURA Agent';
			case 'myTours':
				return 'My Tours — AURA Agent';
			case 'reservations':
				return 'Reservations — AURA Agent';"""
content = content.replace(
    "			case 'settings':\n				return 'Settings — AURA Profile';",
    page_title_logic
)

with open("pages/mypage/index.tsx", "w") as f:
    f.write(content)
