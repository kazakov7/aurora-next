import re

with open('libs/components/chat/ChatDossier.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "<span className=\"about-val\">{member?.createdAt ? moment(member.createdAt).format('MMMM YYYY') : '...'}</span>",
    "<span className=\"about-val\">{member?.createdAt ? moment(isNaN(Number(member.createdAt)) ? member.createdAt : Number(member.createdAt)).format('MMMM YYYY') : '...'}</span>"
)

with open('libs/components/chat/ChatDossier.tsx', 'w') as f:
    f.write(content)
