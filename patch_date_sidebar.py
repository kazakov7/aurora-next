import re

with open('libs/components/member/MemberSidebar.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "moment(member.createdAt).format(\"MMMM YYYY\")",
    "moment(isNaN(Number(member.createdAt)) ? member.createdAt : Number(member.createdAt)).format(\"MMMM YYYY\")"
)

with open('libs/components/member/MemberSidebar.tsx', 'w') as f:
    f.write(content)
