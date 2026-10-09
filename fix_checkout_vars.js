const fs = require('fs');
let code = fs.readFileSync('pages/checkout/index.tsx', 'utf-8');

code = code.replace(
    /const \{ data: tourData, loading: tourLoading \} = useQuery\(GET_TOUR, \{\s*variables: \{ [a-zA-Z]+: id \},/g,
    `const { data: tourData, loading: tourLoading } = useQuery(GET_TOUR, {\n    variables: { tourId: id },`
);

fs.writeFileSync('pages/checkout/index.tsx', code);
console.log("Fixed GET_TOUR variables");
