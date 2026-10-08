import os

files_to_patch = [
    'libs/components/member/MemberArticles.tsx',
    'libs/components/destination/detail/DestinationReviews.tsx',
    'libs/components/mypage/MyProfileNotifications.tsx'
]

for file in files_to_patch:
    if os.path.exists(file):
        with open(file, 'r') as f:
            content = f.read()
        
        # Replace moment(x.createdAt) with moment(isNaN(Number(x.createdAt)) ? x.createdAt : Number(x.createdAt))
        import re
        content = re.sub(
            r"moment\(([^)]+)\.createdAt\)",
            r"moment(isNaN(Number(\1.createdAt)) ? \1.createdAt : Number(\1.createdAt))",
            content
        )
        
        with open(file, 'w') as f:
            f.write(content)
