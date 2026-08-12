/**
 * Production environment.
 *
 * The map deliberately uses Google's keyless embed URL so it works on any
 * domain (localhost, GitHub Pages, Netlify) without an API key. If you later
 * want a dedicated Maps Embed API key, set it here and restrict it in the
 * Google Cloud Console to "Maps Embed API" + your domain (HTTP referrer).
 */
export const environment = {
  production: true,
  googleMapsApiKey: '',
  contactEndpoint: 'https://api.web3forms.com/submit',
  web3formsAccessKey: '8581a73a-20de-4a4f-bf93-b965117e4c87',
};
