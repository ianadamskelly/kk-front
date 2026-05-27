# Kuza Kizazi — Frontend

Next.js 16 (App Router, React 19, Tailwind v4) frontend for the Kuza Kizazi site. Pairs with the Go API at [kk-back](https://github.com/ianadamskelly/kk-back).

## Stack

- Next.js 16 with the App Router and Turbopack
- React 19
- Tailwind CSS v4
- TipTap (rich-text editor in the admin area)

## Layout

```
app/
  (public)/       # marketing site, store, courses, account area
  admin/          # admin dashboard
components/       # shared UI
lib/              # API client, auth/cart/customer contexts, helpers
public/           # static assets
```

## Prerequisites

- Node.js 22+
- npm
- A running [kk-back](https://github.com/ianadamskelly/kk-back) API (locally on `:8080`, or any reachable URL)

## Local development

```bash
npm install
cp .env.local.example .env.local   # if a sample exists; otherwise create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
npm run dev
```

Open <http://localhost:3000>. The dev server reloads on save.

### Environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. Baked into the bundle at build time. | `https://api.kuzakizazi.com` |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (this frontend). Used for absolute URLs in `sitemap.xml`, `robots.txt`, canonical links, and OG tags. | `https://kuzakizazi.com` |

For the customer session cookie to span both subdomains in production, the backend must set `COOKIE_DOMAIN=.kuzakizazi.com` and `COOKIE_SECURE=true`, and its `CORS_ORIGIN` must be the exact frontend URL (no `*`).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on `:3000`. |
| `npm run build` | Production build. Emits `.next/standalone/` (used by Docker). |
| `npm start` | Run the production build (`next start`). |
| `npm run lint` | ESLint. |

## Docker

The Dockerfile is multi-stage and uses Next.js standalone output, so the final image is small.

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.kuzakizazi.com \
  -t kk-front .
docker run --rm -p 3000:3000 kk-front
```

`NEXT_PUBLIC_API_URL` **must** be passed as a build arg — `NEXT_PUBLIC_*` values are inlined at build time, not read at runtime.

## Deploy on Coolify

1. Create a new **Application** from this repo, branch `main`, build pack **Dockerfile**.
2. Under **Build Variables**, set `NEXT_PUBLIC_API_URL` to the backend's public URL (e.g. `https://api.kuzakizazi.com`).
3. Assign a domain (e.g. `kuzakizazi.com`); Coolify/Traefik handles TLS via Let's Encrypt.
4. Deploy. Health check the home page.

Whenever the backend URL changes, you must **rebuild** (not just restart) the frontend.
