import React, { useMemo } from "react";
import Link from "next/link";

type PartnerCardData = {
  name: string;
  desc: string;
  type: string;
  link: string;
  image: string;
  message: string;
};

const HOTELS_DATA: PartnerCardData[] = [
  {
    name: "Aman Resorts",
    desc: "Global Sanctuary Member",
    type: "Hotel Collection",
    link: "/property?search=Aman",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&h=150&fit=crop",
    message:
      "Exclusive sanctuaries offering unparalleled tranquility and white-glove service worldwide.",
  },
  {
    name: "Four Seasons",
    desc: "Preferred Executive Tier",
    type: "Hotel Collection",
    link: "/property?search=Four+Seasons",
    image:
      "https://images.unsplash.com/photo-1542314831-c6a4d1409a50?w=150&h=150&fit=crop",
    message:
      "A hallmark of luxury, bringing you closer to the world’s most coveted destinations.",
  },
  {
    name: "Belmond Heritage",
    desc: "Curated Trains & Stays",
    type: "Hotel Collection",
    link: "/property?search=Belmond",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=150&h=150&fit=crop",
    message:
      "Timeless luxury across legendary train journeys and stunning heritage hotels.",
  },
];

const TOURS_DATA: PartnerCardData[] = [
  {
    name: "Nat Geo Expeditions",
    desc: "Certified Field Naturalists",
    type: "Expedition Operator",
    link: "/tour?search=Expedition",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=150&h=150&fit=crop",
    message:
      "Expert-led journeys designed for curious minds exploring the wild front lines.",
  },
  {
    name: "Abercrombie & Kent",
    desc: "Bespoke Overland Trails",
    type: "Expedition Operator",
    link: "/tour?search=Overland",
    image:
      "https://images.unsplash.com/photo-1534444557930-1014e7dc4e0b?w=150&h=150&fit=crop",
    message:
      "Pioneering overland adventures that balance authentic discovery with profound luxury.",
  },
  {
    name: "Wilderness Safaris",
    desc: "Pure Conservation Concessions",
    type: "Expedition Operator",
    link: "/tour?search=Conservation",
    image:
      "https://images.unsplash.com/photo-1518182170546-076616fdfaaf?w=150&h=150&fit=crop",
    message:
      "Deep immersion in untouched terrains, actively protecting Africa’s wildlife heritage.",
  },
];

const VerifyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 48 48"
    className="verified-icon"
  >
    <polygon
      fill="#42a5f5"
      points="29.62,3 33.053,8.308 39.367,8.624 39.686,14.937 44.997,18.367 42.116,23.995 45,29.62 39.692,33.053 39.376,39.367 33.063,39.686 29.633,44.997 24.005,42.116 18.38,45 14.947,39.692 8.633,39.376 8.314,33.063 3.003,29.633 5.884,24.005 3,18.38 8.308,14.947 8.624,8.633 14.937,8.314 18.367,3.003 23.995,5.884"
    ></polygon>
    <polygon
      fill="#fff"
      points="21.396,31.255 14.899,24.76 17.021,22.639 21.428,27.046 30.996,17.772 33.084,19.926"
    ></polygon>
  </svg>
);

const PartnerCard = ({ card }: { card: PartnerCardData }) => (
  <Link href={card.link} className="marquee-partner-card">
    <div className="card-top">
      <img className="partner-avatar" src={card.image} alt={card.name} />
      <div className="partner-identity">
        <div className="name-wrapper">
          <p className="partner-name">{card.name}</p>
          <VerifyIcon />
        </div>
        <span className="partner-handle">{card.type}</span>
      </div>
    </div>
    <p className="partner-message">{card.message}</p>
    <div className="partner-badge">{card.desc}</div>
  </Link>
);

const MarqueeRow = ({
  data,
  reverse = false,
  speed = 40,
}: {
  data: PartnerCardData[];
  reverse?: boolean;
  speed?: number;
}) => {
  // Triple the data to ensure smooth infinite scrolling for wide screens
  const repeatedData = useMemo(
    () => [...data, ...data, ...data, ...data],
    [data],
  );

  return (
    <div className="marquee-row-wrapper">
      <div
        className={`marquee-scroll-container ${reverse ? "reverse" : ""}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {repeatedData.map((c, i) => (
          <PartnerCard key={`${c.name}-${i}`} card={c} />
        ))}
      </div>
    </div>
  );
};

const TravelPartners = () => {
  return (
    <section className="travel-partners-section">
      <div className="section-container">
        {/* Section Header */}
        <div className="partners-header">
          <span className="section-tag">Global Alliances</span>
          <h2 className="section-title">Trusted Travel Partners</h2>
          <p className="section-subtitle">
            Guaranteed white-glove logistics, priority upgrades, and exclusive
            sanctuary access worldwide.
          </p>
        </div>

        {/* Marquee Area */}
        <div className="partners-marquee-area">
          <div className="marquee-fade-left"></div>
          <MarqueeRow data={HOTELS_DATA} speed={35} />
          <MarqueeRow data={TOURS_DATA} reverse={true} speed={35} />
          <div className="marquee-fade-right"></div>
        </div>
      </div>
    </section>
  );
};

export default TravelPartners;
