/**
 * Production environment.
 *
 * Replace `YOUR_GOOGLE_MAPS_API_KEY` with the real Maps Embed API key, e.g.
 * from your CI secrets before deploying. In the Google Cloud Console, restrict
 * the key to the "Maps Embed API" and your production domain (HTTP referrer).
 */
export const environment = {
  production: true,
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
  contactEndpoint: 'https://api.web3forms.com/submit',
  web3formsAccessKey: '8581a73a-20de-4a4f-bf93-b965117e4c87',
};
