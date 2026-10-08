import React from "react";
import type { NextPage } from "next";
import { useQuery } from "@apollo/client";
import withLayoutMain from "../libs/components/layout/LayoutHome";
import Hero from "../libs/components/homepage/Hero";
import TrendingDestinations from "../libs/components/homepage/TrendingDestinations";
import SpecialStays from "../libs/components/homepage/SpecialStays";
import Experiences from "../libs/components/homepage/Experiences";
import CommunityCurators from "../libs/components/homepage/CommunityCurators";
import TravelPartners from "../libs/components/homepage/TravelPartners";
import LiveDispatches from "../libs/components/homepage/LiveDispatches";
import { GET_DESTINATIONS } from "../apollo/user/query";
import { Destination } from "../libs/types/destination/destination";
import { DestinationsInquiry } from "../libs/types/destination/destination.input";
import { Direction } from "../libs/enums/common.enum";

interface HomeDestinationsResponse {
  getDestinations?: {
    list?: Destination[];
  };
}

const homeDestinationsInput: DestinationsInquiry = {
  page: 1,
  limit: 5,
  sort: "destinationViews",
  direction: Direction.DESC,
  search: {},
};

const Home: NextPage = () => {
  /** APOLLO REQUESTS **/
  const { data, loading } = useQuery<HomeDestinationsResponse>(
    GET_DESTINATIONS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: homeDestinationsInput },
      notifyOnNetworkStatusChange: true,
      ssr: false,
    },
  );
  const destinations = data?.getDestinations?.list ?? [];

  return (
    <div className="home-page-container">
      <Hero />
      <TrendingDestinations
        destinations={destinations.slice(0, 4)}
        loading={loading}
      />
      <SpecialStays />
      <Experiences />
      <CommunityCurators />
      <TravelPartners />
      <LiveDispatches destinations={destinations} loading={loading} />
    </div>
  );
};

export default withLayoutMain(Home);
