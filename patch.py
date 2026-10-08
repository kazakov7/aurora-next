import re

with open("libs/components/mypage/MyProfileWishlist.tsx", "r") as f:
    content = f.read()

# 1. Remove page state
content = re.sub(r'const \[page, setPage\] = useState<number>\(\d+\);\n', '', content)

# 2. Change limit: 6 to limit: 50
content = content.replace('limit: 6,', 'limit: 50,')

# 3. Change page: page to page: 1
content = content.replace('page: page,', 'page: 1,')

# 4. Remove slice(0, 6)
content = content.replace('.slice(0, 6);', ';')

# 5. Remove totalPages logic
content = re.sub(r'const totalPages = Math\.ceil\(totalItems / 6\) \|\| 1;\n', '', content)

# 6. Remove pagination UI block
pagination_pattern = r'\{totalPages > 1 && \(\s*<div className="pagination-wrapper">.*?</button>\s*</div>\s*</div>\s*\)\}'
content = re.sub(pagination_pattern, '', content, flags=re.DOTALL)

with open("libs/components/mypage/MyProfileWishlist.tsx", "w") as f:
    f.write(content)
