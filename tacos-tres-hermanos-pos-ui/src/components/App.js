import React from 'react';
import t3h from '../api/t3h';
import SearchBar from './SearchBar';

class App extends React.Component {
  state = {images: [] };

  onSearchSubmit = async (term) => {
    const response = await t3h.get('/search/photos', {
      params: { query: term },
      headers: {
        Authorization: 'Client-ID jmNqMcKBP2AcMPEyE9GWodZg9Zqf7qZLEDKbSyvfhCo'
      }
    });
    
    this.setState({images: response.data.results});
  };

  render() {
    return (
      <div className='ui container' style={{marginTop: '10px'}}>
        <SearchBar onSubmit={this.onSearchSubmit} />
        Found: {this.state.images.length} images
      </div>
    );
  }
}

export default App;