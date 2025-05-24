interface Config {
  API_BASE_URL: string;
  ANALYTICS_ENDPOINT: string;
  MAX_RETRIES: number;
  REQUEST_TIMEOUT: number;
}

const config: Config = {
  API_BASE_URL: 'https://covercraft-api.your-account.workers.dev/api',
  ANALYTICS_ENDPOINT: 'https://covercraft-api.your-account.workers.dev/api/analytics',
  MAX_RETRIES: 3,
  REQUEST_TIMEOUT: 30000
};

export default config; 