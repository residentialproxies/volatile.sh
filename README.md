# volatile.sh

Zero-knowledge, burn-after-reading secret sharing on Cloudflare Workers + Durable Objects.

## Setup

### Local Development

1. Clone the repository:

```bash
git clone https://github.com/residentialproxies/volatile.sh.git
cd volatile.sh
```

2. Install dependencies:

```bash
npm install
```

3. Create `wrangler.toml` from the example:

```bash
cp wrangler.toml.example wrangler.toml
```

4. Add your Cloudflare Account ID to `wrangler.toml`:

```toml
# Add this line at the top of wrangler.toml
account_id = "YOUR_ACCOUNT_ID_HERE"
```

Alternatively, set the environment variable:

```bash
export CLOUDFLARE_ACCOUNT_ID="YOUR_ACCOUNT_ID_HERE"
```

5. Run locally:

```bash
npm run dev -- --local --port 8787
```

## Deployment

### Manual Deployment

```bash
npm run deploy
```

### Automatic Deployment via GitHub Actions

The project automatically deploys to Cloudflare Workers when code is pushed to the `main` branch.

**Required GitHub Secrets:**

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

## Test

- Run tests: `npm test`

## Frontend source

- React UI source lives in `volatile.sh-front.sh/` and is built into `dist/` (served by Wrangler assets).

## Security model (high level)

- Secrets are encrypted client-side with AES-256-GCM.
- The decryption key is stored in the URL fragment (`#...`) which browsers do not send to servers.
- Server stores only ciphertext + IV and deletes it atomically on first read (Durable Objects).

## Security Notes

**Never commit sensitive files:**

- `wrangler.toml` (contains account ID)
- `.env` files
- API keys or tokens

All sensitive configuration uses environment variables or GitHub Secrets.
