import client from './client';
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const ME = gql`
  query me {
    user(login: "ShuheiYoshino") {
      name
      avatarUrl
    }
  }
`

function App() {
  return (
    <ApolloProvider client={client}>
      <div>Hello, GraphQL</div>

      <Query query={ME}>
        {
          ({ loading, error, data}) => {
            if (loading) return 'loading...';
            if (error) return `Error! ${error.message}`;

            return <div>{data.user.name}</div>
          }
        }
      </Query>
    </ApolloProvider>
  );
}

export default App;
