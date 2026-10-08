import re

with open("apollo/user/query.ts", "r") as f:
    content = f.read()

pattern = r"(query GetMyAgentApplications.*?)(status)(\s+)(comment)(.*?\})"
replacement = r"\1verificationStatus\3rejectionReason\5"

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("apollo/user/query.ts", "w") as f:
    f.write(content)
