import type { AppProps } from "next/app";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import React, { useState } from "react";
import { light } from "../scss/MaterialTheme";
import { ApolloProvider } from "@apollo/client";
import { useApollo } from "../apollo/client";
import { I18nProvider } from "../libs/i18n";
//@ts-ignore
import "../scss/app.scss"; //@ts-ignore
import "../scss/pc/main.scss"; //@ts-ignore
import "../scss/mobile/main.scss";

export default function App({ Component, pageProps }: AppProps) {
  const [theme] = useState(createTheme(light));
  const client = useApollo(pageProps.initialApolloState);

  return (
    <I18nProvider>
      <ApolloProvider client={client}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </ApolloProvider>
    </I18nProvider>
  );
}
