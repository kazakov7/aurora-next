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
import {
  GET_POPULAR_DESTINATIONS_BY_BOOKINGS,
  GET_TOP_AGENTS,
  GET_TOP_PROPERTIES,
  GET_TOP_TOURS,
  GET_TOP_TRAVELERS,
  GET_TRENDING_DESTINATIONS,
} from "../apollo/ranking/query";
import { Destination } from "../libs/types/destination/destination";
import { Property } from "../libs/types/property/property";
import { Tour } from "../libs/types/tour/tour";
import { Member } from "../libs/types/member/member";
import { RankingAgent, RankingList } from "../libs/types/ranking/ranking";
import { AgentType } from "../libs/enums/agent.enum";
import AuroraLogo3D from "@/libs/components/AuroraLogo3D";

const rankingOptions = {
  fetchPolicy: "cache-and-network" as const,
  notifyOnNetworkStatusChange: true,
  ssr: false,
};

const Home: NextPage = () => {
  /** APOLLO REQUESTS **/
  const trending = useQuery<{
    getTrendingDestinations?: RankingList<Destination>;
  }>(GET_TRENDING_DESTINATIONS, {
    ...rankingOptions,
    variables: { input: { limit: 6 } },
  });
  const properties = useQuery<{ getTopProperties?: RankingList<Property> }>(
    GET_TOP_PROPERTIES,
    { ...rankingOptions, variables: { input: { limit: 4 } } },
  );
  const tours = useQuery<{ getTopTours?: RankingList<Tour> }>(GET_TOP_TOURS, {
    ...rankingOptions,
    variables: { input: { limit: 4 } },
  });
  const travelers = useQuery<{ getTopTravelers?: RankingList<Member> }>(
    GET_TOP_TRAVELERS,
    { ...rankingOptions, variables: { input: { limit: 4 } } },
  );
  const hotelAgents = useQuery<{ getTopAgents?: RankingList<RankingAgent> }>(
    GET_TOP_AGENTS,
    {
      ...rankingOptions,
      variables: { input: { agentType: AgentType.HOTEL, limit: 4 } },
    },
  );
  const tourAgents = useQuery<{ getTopAgents?: RankingList<RankingAgent> }>(
    GET_TOP_AGENTS,
    {
      ...rankingOptions,
      variables: { input: { agentType: AgentType.TOUR, limit: 4 } },
    },
  );
  const popularDestinations = useQuery<{
    getPopularDestinationsByBookings?: RankingList<Destination>;
  }>(GET_POPULAR_DESTINATIONS_BY_BOOKINGS, {
    ...rankingOptions,
    variables: { input: { limit: 5 } },
  });

  return (
    <div className="home-page-container">
      <Hero destinations={trending.data?.getTrendingDestinations?.list ?? []} />
      <TrendingDestinations
        destinations={trending.data?.getTrendingDestinations?.list ?? []}
        loading={trending.loading}
        error={trending.error}
      />
      <SpecialStays
        properties={properties.data?.getTopProperties?.list ?? []}
        loading={properties.loading}
        error={properties.error}
      />
      <Experiences
        tours={tours.data?.getTopTours?.list ?? []}
        loading={tours.loading}
        error={tours.error}
      />
      ;
      <CommunityCurators
        travelers={travelers.data?.getTopTravelers?.list ?? []}
        loading={travelers.loading}
        error={travelers.error}
      />
      <TravelPartners
        hotelAgents={hotelAgents.data?.getTopAgents?.list ?? []}
        tourAgents={tourAgents.data?.getTopAgents?.list ?? []}
        loading={hotelAgents.loading || tourAgents.loading}
        error={hotelAgents.error || tourAgents.error}
      />
      <LiveDispatches
        destinations={
          popularDestinations.data?.getPopularDestinationsByBookings?.list ?? []
        }
        loading={popularDestinations.loading}
        error={popularDestinations.error}
      />
    </div>
  );
};

export default withLayoutMain(Home);
