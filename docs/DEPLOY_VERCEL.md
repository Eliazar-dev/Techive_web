# Deploy the frontend on Vercel

1. Push `techive-web` to its own GitHub repo. In Vercel: **Add New > Project**, import it. Framework preset **Vite** (build `npm run build`, output `dist`, detected automatically).
2. Environment Variables (Production):
   - `VITE_API_URL` = `https://<your-api>.vercel.app/api` (or your API domain + `/api`, no trailing slash)
   - `VITE_GOOGLE_CLIENT_ID` = your Google OAuth web client ID
   - `VITE_MEDIA_URL` = optional, base URL where the hero videos are hosted
3. Deploy, then add your domain under **Settings > Domains**.
4. Google Cloud Console > Credentials > your OAuth client: add your site URL (e.g. `https://techive.co.ke`) to **Authorized JavaScript origins**.
5. On the API project set `CORS_ALLOWED_ORIGINS` to the exact frontend URL (no trailing slash), then redeploy the API.

`vercel.json` already contains the single-page-app rewrite (so `/services`, `/admin`... work on refresh) and long cache headers for built assets.

## Hero videos
Keep videos small (see `public/videos/README.txt`). Vercel serves files from `public/videos` fine, but each file must stay under 100 MB and large videos use bandwidth quickly. For bigger videos host them on your media service and set `VITE_MEDIA_URL`.
