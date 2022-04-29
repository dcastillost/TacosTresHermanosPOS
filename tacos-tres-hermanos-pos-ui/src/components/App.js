import React from 'react';
import t3h from '../api/t3h';
import SearchBar from './SearchBar';
import MenuList from './MenuList';
import Route from './Route';
import Header from './Header';

class App extends React.Component {
  state = { menuItems: [] };

  onSearchSubmit = async (term) => {
    const response = await t3h.get('/search/photos', {
      params: { query: term },
      headers: {
        Authorization: 'Client-ID jmNqMcKBP2AcMPEyE9GWodZg9Zqf7qZLEDKbSyvfhCo'
      }
    });

    this.setState({ menuItems: response.data.results });
    // console.log(this.state.menuItems);
  };

  componentDidMount() {
    // this.onSearchSubmit('cars');
  }

  render() {
    return (
      <div className='ui container' style={{ marginTop: '10px' }}>
        <Header />
        <SearchBar onSubmit={this.onSearchSubmit} />
        <Route path='/food' request={this.onSearchSubmit}>
          <MenuList menuItems={this.state.menuItems} />
        </Route>
        <Route path='/goods' request={this.onSearchSubmit}>
          <MenuList menuItems={this.state.menuItems} />
        </Route>

        {/* <MenuList menuItems={this.state.menuItems} /> */}
      </div>
    );
  }
}

export default App;