import React from 'react';
import client from './client';
import { ApolloProvider, Mutation, Query } from 'react-apollo';
import { SEARCH_REPOSITORIES, ADD_STAR, REMOVE_STAR } from './graphql';

const StarButton = props => {
  const { node, query, first, last, before, after } = props;
  const totalCount = node.stargazers.totalCount;
  const viewerHasStarred = node.viewerHasStarred;
  const startCount = totalCount === 1 ? '1 star' : `${totalCount} stars`;
  const StarStatus = ({addOrRemoveStar}) => {
    return (
      <button
        onClick={
          () => addOrRemoveStar({ variables: { input: { starrableId: node.id }}})
        }
      >
        {startCount} | {viewerHasStarred ? 'starred': '-'}
      </button>
    )
  }

  return (
    <Mutation
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
      refetchQueries={
        [
          {
            query: SEARCH_REPOSITORIES,
            variables: { query, first, last, before, after}
          }
        ]
      }
    >
      {
        addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar}/>
      }
    </Mutation>
  )
}

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: ''
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = DEFAULT_STATE
    this.handleSubmit = this.handleSubmit.bind(this)
    this.myRef = React.createRef()
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({
      query: this.myRef.current.value
    })
  }

  goNext(search) {
    this.setState({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null
    })
  }

  goPrevious(search) {
    this.setState({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor
    })
  }

  render() {
    const { query, first, last, before, after } = this.state
    return (
      <ApolloProvider client={client}>
        <form onSubmit={this.handleSubmit}>
          <input ref={this.myRef}/>
          <input type="submit" value="Submit" />
        </form>
        <div>Hello, GraphQL</div>

        <Query
          query={SEARCH_REPOSITORIES}
          variables={{ query, first, last, before, after }}
        >
          {
            ({loading, error, data}) => {
              if (loading) return 'loading...';
              if (error) return `Error! ${error.message}`;

              const search = data.search;
              const repositoryCount = search.repositoryCount;
              const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories';
              const title = `GitHub Repositories Search Results - ${data.search.repositoryCount} ${repositoryUnit}`
              return (
                <React.Fragment>
                  <h2>{title}</h2>
                  <ul>
                    {search.edges.map(edge => {
                      const node = edge.node;
                      return (
                        <li key={node.id}>
                          <a href={node.url} target="_blank">{node.name}</a>
                          &nbsp;
                          <StarButton node={node} {...{query, first, last, before, after}}/>
                        </li>
                      )
                    })}
                  </ul>

                  {
                    search.pageInfo.hasPreviousPage === true ?
                      <button
                        onClick={this.goPrevious.bind(this, search)}
                      >
                        Previous
                      </button>
                      :
                      null
                  }
                  {
                    search.pageInfo.hasNextPage === true ?
                      <button
                        onClick={this.goNext.bind(this, search)}
                      >
                        Next
                      </button>
                      :
                      null
                  }
                </React.Fragment>

              )
            }
          }
        </Query>
      </ApolloProvider>
    );
  }
}

export default App;
