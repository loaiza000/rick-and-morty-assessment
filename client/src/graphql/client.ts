import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client/core';

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;
if (!graphqlUrl) {
  console.error('VITE_GRAPHQL_URL is not set. Check your .env file.');
}

const httpLink = new HttpLink({
  uri: graphqlUrl,
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
