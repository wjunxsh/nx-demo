import React from "react";

import { fetch as fetchPolyfill } from 'whatwg-fetch'

import { Redirect } from "@shopify/app-bridge/actions";

import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

import { authenticatedFetch } from "@shopify/app-bridge-utils";

import { createStore } from '../utils/store';
import useDefault from './default';
import {
  useAppBridge,
} from "@shopify/app-bridge-react";

const Store = createStore({
  useDefault,
});

export const useHooks = Store.useHooks;
export const getHooks = Store.getHooks;
export const withHooks = Store.withHooks;

export const StoreProvider = ({ children }) => {
  return <Store.Provider>{children} </Store.Provider>;
}

export const Provider = ({ children }) => {
  let app = useAppBridge();
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri:"/shopify/graphql",
      credentials: "include",
      fetch: userLoggedInFetch(app),
    }),
  });
  return <ApolloProvider client={client}>
    <Store.Provider>{children}</Store.Provider>
  </ApolloProvider>;
}

export function userLoggedInFetch(app) {

  const fetchFunction = authenticatedFetch(app);

  return async (uri, options) => {

    const response = await fetchFunction(uri, options);
    if (
      response.headers.get("X-Shopify-API-Request-Failure-Reauthorize") === "1"
    ) {
      const authUrlHeader = response.headers.get(
        "X-Shopify-API-Request-Failure-Reauthorize-Url"
      );
      const redirect = Redirect.create(app);
      redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/`);
      return null;
    }
    return response;

  };

}






export default Store;
