import React from 'react';
import Link from 'next/link';
import { Destination } from '../../../types/destination/destination';
import { getImageUrl } from '../../../config';

interface DestinationCitiesProps {
	destination: Destination;
	cities: Destination[];
}

const fallbackCityImages = [
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCVDztHelxkq6wVTLni0kVvF-OSdkk9FlSWBOPkrX57ypaEawOWcWW4sB-ijuuD0ssL0KoSa68nU1aeM_go4anMguVniS_tEdCrHrnYVzcTrCmrkSitvrQbMO7BxOXc2QwUNMSqLtmEdp6bAIiPQO3Nuz9Sx2gIo4PBbFlW0jskDYOWZqPpEbfMYchIXDf1DGykbZSAJQDa2Lu2ouQOX8mjqCdlL86VmNfs2kxl4fwnu-qZPLPCYm53',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuA6gRItolLUSmoVoAeppFFSnYt882g35Bba7vqN8Lx3-6x-TsGNUNWn1UXKQca6du0h6Cy95MYR2v7hi-lbLEh6_G5qyAVOd7GvCx6-ORz6S6PxgRz5_8YAyU6wq26fFPlIpxampFxRgpNiMkm_jOzeq3hFREz7DjT6Zll5W1lptk4hkI0msetLmUlZMZixv1qfNwGTXfNSdleMncnXxI0tyUzwsM5VMYFy4fd8_vdLoR1x0XhRKYOo',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuA-tCX_tRbldF7RbYNToMTZXR5njlk_MWCb7BflPZQatawTlnK6DNC1w1DGnodHkcjVdxCMaPWSurKNKec_1yrnhf46kgcOxP-Hq7J9pT7SKSK0H1pbfCSrInAfYyQgAs-SEJTSdu7fkPpSsRmxnXSrftmmFC3yXgzLI9N2Q0ZE8sIdy54eM3q10c9UCogDotFniY9QeYrZKYsFfzRbm5aqIBbnVIkNGwX8AI20QoxasVPmgbKOj5aU',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuD3x23-7Gw1rfhyWVVYZIAZ91Fqi5bbtRV_2uKpXk2qBuR0MZAV9uY6_2VEytjYi-1u070_Vf047BJHLVZxdJzdoD5RDFHe66cltQgMSr7o3gGTeJ0ShD0MTD9VVDkL4IvdEsvlhDM8VJiZYXzjVnuHXKTh1d5yQAmpFBGX19qdZiHvRsthXP4R3m5nLPfNDPvE3BJz7GcxYQSYF-UHaeyvz73dG6NSi2PXidQN0hly7k8yfvR0WhIy',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuCmEU55DnOzkWpBLEs3B7Hx-_JWziex0iTpcOl5Az4lDKtGMZmOj2G14OX41qEX9VjYEYAQI78XreacFM7DKPqZ6WeWCfD-azd48yVPDwW5FAibN7rTDjphtnyIo4jeyw8JGhIeeDmP2_7rt1sFJ8BbuhfcaXkvLJchlQdA7IdlZN5WfdKZrnqFVSI_WbeiO4jDbBaVVaGw7OtAbBNEw_ojkGY6MJfJOwRVe6ffuvrBu1V_PxhZygD_',
	'https://lh3.googleusercontent.com/aida-public/AB6AXuAN3_cgo6sKpA7QDW82-P2FuBvbbA3R9Cu7CUt2K8Gv_3rht4Oayf3FcyzptkQkZxcsq1rGaoEn5DP_DlO00Fx9Y8w855LIQFPFQIfVedmVFriCl496LtygxMeS6XWlhzD5ZeL-7_IyMl0g3KlS2mihqqIUnJl0OB0gnetgNe4zBglol0x4s33q-Nf_YLINCzWkDMKTij0Asyeci9v5MwdodWUdaGqZvHPPAomi5zU-FR3JBjUfiyw6',
];

const DestinationCities = ({ destination, cities }: DestinationCitiesProps) => {
	if (!cities || cities.length === 0) return null;

	return (
		<section className="destination-cities-section" id="cities">
			<div className="cities-header-row">
				<h2 className="cities-main-heading">Explore {destination.destinationCountry}</h2>
				<p className="cities-subheading">Find your next favorite destination.</p>
			</div>

			<div className="cities-cards-grid">
				{cities.map((city, idx) => {
					const fallback = fallbackCityImages[idx % fallbackCityImages.length];
					const imgUrl = getImageUrl(city.destinationImages?.[0], fallback);

					return (
						<article key={city._id || idx} className="city-spotlight-card">
							<Link href={`/destination/detail?id=${city._id}`} className="card-link-wrapper">
								<div className="city-image-container">
									<img
										src={imgUrl}
										alt={city.destinationName}
										className="city-img"
										onError={(e: any) => {
											e.target.src = fallback;
										}}
									/>
									<div className="city-image-scrim"></div>
									<div className="city-name-overlay">{city.destinationName}</div>
								</div>

								<div className="city-info-body">
									<p className="city-desc-text">
										{city.destinationDesc ||
											`Historic heritage seamlessly interwoven with breathtaking topography in ${city.destinationName}.`}
									</p>
									<div className="explore-cta-link">
										<span>Explore {city.destinationName}</span>
										<span className="material-symbols-outlined icon-arrow">arrow_forward</span>
									</div>
								</div>
							</Link>
						</article>
					);
				})}
			</div>
		</section>
	);
};

export default DestinationCities;
