# BYTTEHMD

Static product site with server-side Cloudflare Pages Functions and Vercel API routes. The browser never reads or writes Firestore directly. `server/shared.mjs` contains the shared API implementation.

## Firestore product schema

Documents live in the `products` collection. Existing legacy fields are `brand`, `model`, `category`, `description`, `price`, `stock`, and `image`. Public listing requires every document to be explicitly reviewed and marked with the new fields below. Legacy documents without those fields are deliberately hidden; no automatic publication migration is performed.

| Field | Type | Values / example |
| --- | --- | --- |
| `publicationStatus` | string | `draft` or `published` |
| `availabilityStatus` | string | `in_stock`, `on_order`, or `confirm` |
| `brand` | string | `Miele` |
| `model` | string | `G 7100 SC` |
| `category` | string | `Посудомоечные машины` |
| `description` | string | Product description; omit if unknown |
| `price` | number | `25000` (required, non-negative) |
| `stock` | integer | `1` for in-stock items; `0` for order/confirm |
| `dimensionsMm` | map | `{width: 600, height: 845, depth: 570}`; omit unless complete |
| `features` | array of strings | `['NoFrost', 'инверторный мотор']` |
| `image` | string | optional local path such as `./assets/miele-card.jpg` |

Only complete, `published` product documents with a known availability status and price are returned. `in_stock` requires a positive integer stock. `on_order` and `confirm` require stock zero. Incomplete documents and drafts are excluded. A product with unknown dimensions or functions is excluded when those filters are requested. Prices, stock, guarantee, item condition, and delivery estimates are never inferred.

Deploy `firestore.rules` after the server credentials and API routes have been prepared. The rules deny all browser reads and writes, including `orders`. Server credentials use Google IAM and bypass these rules; grant the service account only the Firestore access required by the app and protect the secret carefully.

## API and secrets

The following server-only settings are required on the selected host (Preview first):

| Setting | Purpose |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Service account JSON stored as an encrypted secret |
| `FIREBASE_PROJECT_ID` | Project that currently contains the website's `products` collection; may be omitted to use the project id in the service account |
| `TURNSTILE_SECRET_KEY` | Secret used to verify Turnstile tokens on the server |
| `TURNSTILE_SITE_KEY` | Public site key returned by `/api/config` |
| `RATE_LIMITER_TOKEN` | Shared secret between API and the rate-limiter Worker |
| `RATE_LIMITER_URL` | Required only on Vercel: private/secret-protected Worker endpoint URL |
| `OPENROUTER_KEYS` | Comma-separated encrypted API keys; never place in browser code |
| `OPENROUTER_MODEL` | Optional model override; defaults to `openrouter/auto` |

Routes:

- `GET /api/catalog` returns only public, valid, published products. `GET /api/catalog?id=...` returns one published card or 404.
- `GET /api/config` returns only the public Turnstile site key.
- `POST /api/chat` accepts up to eight recent messages, optional bounded criteria, and a Turnstile token. The server filters Firestore results and sends at most three matching products to OpenRouter. Product cards in the response are built from Firestore data, not model output.
- `POST /api/orders` validates and writes a short request after rate-limit and Turnstile checks.

The browser stores up to 40 chat messages in `localStorage`; history and personal data are not written to logs. API routes do not log message text, phone numbers, tokens, or IP addresses. CORS/Origin is a browser policy only and is not treated as bot protection.

## Cloudflare Pages setup

1. Verify which Firebase project contains the existing `products` collection before creating credentials. The previous committed client configuration pointed to project `bytteh-website`, while the Firebase Console screenshot shows `byttehmd-38a40db3`; do not assume the latter contains the live catalog. Create a dedicated service account in the project with the catalog and minimum required IAM permissions. Save the entire service account JSON as the encrypted `FIREBASE_SERVICE_ACCOUNT_JSON` secret and set `FIREBASE_PROJECT_ID` to that same project, or omit it to use the service account project id. Do not commit the JSON.
2. Create a Turnstile widget for the Preview and production hostnames. Set the server secret and site key using the names above. The browser obtains the public key from `/api/config`; verification happens server-side.
3. Deploy the Durable Object limiter separately: from `workers/rate-limiter`, run `npx wrangler secret put RATE_LIMITER_TOKEN`, then `npx wrangler deploy`. Set the same random token as a Pages secret. Bind the deployed Worker to the Pages project as `RATE_LIMITER` (service binding) for its `/consume` endpoint. Confirm the binding name exactly matches.
4. Connect this repository to Pages with production branch `main`, no framework preset, build command `exit 0`, and output directory `.`. Add all API secrets and public site key in Preview first. Existing Pages Functions map the routes above.
5. Migrate catalog documents manually: inspect each old document and set publication/availability status. Do not mark drafts published without review. Add complete dimensions/features only when verified. Keep `stock` positive only for `in_stock`; use zero for `on_order` and `confirm`.
6. Check Preview end to end, then publish the deny-all Firestore rules and verify that browser SDK requests fail. Keep an administrator path for inventory management outside this public site.

The rate limiter applies 10 chat messages per 10 minutes and 40 per day per hashed IP; orders are limited to 3 per 10 minutes and 10 per day. Unknown/failed rate-limiter configuration fails closed. The Worker keeps counters in Durable Object SQLite storage and does not persist raw IP addresses. OpenRouter requests use a 450-token response limit and a bounded recent history. Configure a monthly key spend limit in OpenRouter if a hard cost ceiling is desired; this repository does not set one.

## Vercel

Vercel route wrappers under `api/` use the same shared implementation. Add the same secrets as Vercel environment variables. Also set `RATE_LIMITER_URL` to the deployed Worker URL and `RATE_LIMITER_TOKEN` as a secret. The Worker endpoint requires the matching bearer token. Test Preview before Production.

## Local checks

Run `node --test` for the server validation/filtering tests. Local API requests require the same server secrets and a configured rate limiter/Turnstile; missing settings fail closed by design. Do not use real personal data for tests.
