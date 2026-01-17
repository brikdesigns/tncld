require('dotenv').config();
const axios = require('axios');

const API_TOKEN = process.env.WEBFLOW_API_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;

const api = axios.create({
  baseURL: 'https://api.webflow.com',
  headers: {
    Authorization: `Bearer ${API_TOKEN}`,
    'accept-version': '1.0.0',
    'Content-Type': 'application/json',
  },
});

async function getSite() {
  try {
    const siteRes = await api.get(`/sites/${SITE_ID}`);
    console.log('Site data:', siteRes.data);
  } catch (err) {
    console.error('Failed to fetch site:', err.response ? err.response.data : err.message);
    if (err.response) {
      console.error('Full error response:', err.response);
    } else {
      console.error('Full error object:', err);
    }
    process.exit(1);
  }
}

getSite(); 