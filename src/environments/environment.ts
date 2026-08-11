/**
 * Development / default environment.
 *
 * When no Google Maps API key is configured the contact map falls back to the
 * public keyless embed, so local development always works.
 */
export const environment = {
  production: false,
  googleMapsApiKey: '',
  contactEndpoint: 'https://api.web3forms.com/submit',
  web3formsAccessKey: '8581a73a-20de-4a4f-bf93-b965117e4c87',
};
