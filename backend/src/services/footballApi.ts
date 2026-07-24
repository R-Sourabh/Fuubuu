const BASE_URL = 'https://v3.football.api-sports.io';

/**
 * A helper function to fetch data from the external api-football (API-Sports) API.
 * Throws an error if the API key is not configured or if the external API call fails.
 */
export async function fetchFootballData(endpoint: string, params?: Record<string, any>) {
  const apiKey = process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_DATA_API_KEY;

  // Build query string if params are provided
  let queryStr = '';
  if (params && Object.keys(params).length > 0) {
    const cleanParams: Record<string, string> = {};
    for (const key of Object.keys(params)) {
      if (params[key] !== undefined && params[key] !== null) {
        cleanParams[key] = String(params[key]);
      }
    }
    const separator = endpoint.includes('?') ? '&' : '?';
    queryStr = separator + new URLSearchParams(cleanParams).toString();
  }

  // Check if API key is configured
  if (!apiKey || apiKey === 'your_api_key_here' || apiKey === '') {
    throw new Error('API-Football key is not configured. Please set a valid API_FOOTBALL_KEY in your backend .env file.');
  }

  const url = `${BASE_URL}${endpoint}${queryStr}`;
  console.log(`[API-Football] Fetching: ${url}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'x-apisports-key': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    const errorMessage = errorJson.message || `API request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  const data = await response.json();
  
  // Check for inline errors returned by API-Sports
  if (data && data.errors && Object.keys(data.errors).length > 0) {
    // If it's an array or object of messages
    const errs = data.errors;
    if (typeof errs === 'object') {
      const messages = Object.entries(errs).map(([k, v]) => `${k}: ${v}`).join(', ');
      throw new Error(`API-Football Error: ${messages}`);
    }
    throw new Error(`API-Football Error: ${JSON.stringify(errs)}`);
  }

  return data;
}
