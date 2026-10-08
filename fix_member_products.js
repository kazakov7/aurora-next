const fs = require('fs');

let code = fs.readFileSync('libs/components/member/MemberProducts.tsx', 'utf-8');

const targetStr = `			{loading && list.length === 0 ? (
				<p className="member-profile-state">Loading {title.toLowerCase()}...</p>
			) : list.length > 0 ? (
				<div className={gridClass}>
					{isHotel
						? propertiesList.map((prop: any) => (
								<PropertyCard
									key={prop._id}
									property={prop}
									likePropertyHandler={likePropertyHandler}
								/>
						  ))
						: toursList.map((tour: any) => (
								<TourCard
									key={tour._id}
									tour={tour}
									likeTourHandler={likeTourHandler}
								/>
						  ))}
				</div>
			) : (`;

const newStr = `			{loading && list.length === 0 ? (
				<p className="member-profile-state">Loading {title.toLowerCase()}...</p>
			) : list.length > 0 ? (
				<div className={isHotel ? "property-page-wrapper" : "tour-page-wrapper"} style={{ background: 'transparent' }}>
					<div className={isHotel ? "property-listing-main" : "tour-listing-main"}>
						<div className={gridClass}>
							{isHotel
								? propertiesList.map((prop: any) => (
										<PropertyCard
											key={prop._id}
											property={prop}
											likePropertyHandler={likePropertyHandler}
										/>
								  ))
								: toursList.map((tour: any) => (
										<TourCard
											key={tour._id}
											tour={tour}
											likeTourHandler={likeTourHandler}
										/>
								  ))}
						</div>
					</div>
				</div>
			) : (`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, newStr);
    fs.writeFileSync('libs/components/member/MemberProducts.tsx', code);
    console.log("Fixed MemberProducts layout wrapper");
} else {
    console.log("Could not find string");
}
