// Microsoft sign-in (MSAL popup). Loaded lazily so it adds nothing to the first page load.
const CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID
export const MS_ENABLED = !!CLIENT_ID

let app
export async function microsoftIdToken() {
  const { PublicClientApplication } = await import('@azure/msal-browser')
  if (!app) {
    app = new PublicClientApplication({
      auth: { clientId: CLIENT_ID, authority: 'https://login.microsoftonline.com/common', redirectUri: `${window.location.origin}/blank.html` },
      cache: { cacheLocation: 'sessionStorage' },
    })
    await app.initialize()
  }
  const r = await app.loginPopup({ scopes: ['openid', 'profile', 'email'], prompt: 'select_account' })
  return r.idToken
}
