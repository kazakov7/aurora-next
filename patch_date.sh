# Add moment import
sed -i '' -e '1a\
import moment from "moment";
' pages/_admin/users/index.tsx

# Replace date rendering
sed -i '' -e "s/<span className=\"date-text\">{new Date(member.createdAt).toLocaleDateString()}<\/span>/<span className=\"date-text\">{member.createdAt ? moment(member.createdAt).format('MMM DD, YYYY') : '-'}<\/span>/g" pages/_admin/users/index.tsx
