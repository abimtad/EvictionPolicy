import axios from 'axios';

const BASE_URL = 'https://icanhazdadjoke.com/j';

export async function fetchJokeById(jokeId) {
  const url = `${BASE_URL}/${encodeURIComponent(jokeId)}`;
  const response = await axios.get(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'evictionPolicy-backend/1.0' },
    timeout: 8000
  });
  return response.data;
}
