import React from 'react';
import t3h from '../api/t3h';
import SearchBar from './SearchBar';
import MenuList from './MenuList';

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
    console.log(this.state.menuItems);
  };

  componentDidMount() {
    this.onSearchSubmit('cars');
  }

  showMenu() {
    if (window.location.pathname === '/' || window.location.pathname === '/menu') {
      return <MenuList menuItems={this.state.menuItems} />
    }
  }

  showGoodsMenu() {
    if (window.location.pathname === '/goods') {
      return <MenuList menuItems={this.state.menuItems} />
    }
  }

  render() {
    return (
      <div className='ui container' style={{ marginTop: '10px' }}>
        <SearchBar onSubmit={this.onSearchSubmit} />
        Found: {this.state.menuItems.length} menuItems
        {this.showMenu()}
        {/* <MenuList menuItems={this.state.menuItems} /> */}
      </div>
    );
  }
}

export default App;