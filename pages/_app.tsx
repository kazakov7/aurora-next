import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import React, { useState } from "react";
import { light } from "../scss/MaterialTheme";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../apollo/client";
import { I18nProvider } from "../libs/i18n";
import MobileMaintenanceGate from "../libs/components/common/MobileMaintenanceGate";
//@ts-ignore
import "../scss/app.scss"; //@ts-ignore
import "../scss/pc/main.scss"; //@ts-ignore
import "../scss/mobile/main.scss";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function App({ Component, pageProps }: AppProps) {
  const [theme] = useState(createTheme(light));
  const client = useApollo(pageProps.initialApolloState);

  return (
    <I18nProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <Head>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1, viewport-fit=cover"
            />
          </Head>
          <CssBaseline />
          <MobileMaintenanceGate>
            <Component {...pageProps} />
          </MobileMaintenanceGate>
        </ThemeProvider>
      </ApolloProvider>
    </I18nProvider>
  );
}
