import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import t3h from '../api/t3h';
import SearchBar from './SearchBar';
import MenuList from './MenuList';
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
      <div className='ui container'>
        <BrowserRouter>
          <div>
            <Header />
            <SearchBar onSubmit={this.onSearchSubmit} />
            {/* <Route path='/' exact component={MenuList} /> */}
            {/* <Route path='/goods' component={MenuList} /> */}
            {/* <MenuList menuItems={this.state.menuItems} /> */}
            {/* how to pass props to MenuList?? */}
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;