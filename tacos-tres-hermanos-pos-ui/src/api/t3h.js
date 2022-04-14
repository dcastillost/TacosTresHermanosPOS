//Tacos 3 Hermanos API
import axios from 'axios';

export default axios.create({
  baseURL: 'https://api.unsplash.com',
  headers: {
    Authorization: 'Client-ID jmNqMcKBP2AcMPEyE9GWodZg9Zqf7qZLEDKbSyvfhCo'
  }
});