# M&A Conquest – Backend

Node.js + Socket.IO server for Shri Ram M&A Conquest Finance Wordle.

## Deploy to Render (Free)

1. Push this folder to a **new GitHub repo** (e.g. `conquest-backend`)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set these:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
5. Add environment variable:
   - `ADMIN_KEY` = any password you choose (default: `conquest2025`)
6. Click **Deploy**
7. Your backend URL will look like: `https://conquest-backend-xxxx.onrender.com`

> ⚠️ Copy this URL — you need it for the frontend repo.

## Run Locally

```bash
npm install
npm start
# Runs on http://localhost:3000
```

## Environment Variables

| Variable    | Default        | Description          |
|-------------|----------------|----------------------|
| `PORT`      | `3000`         | Auto-set by Render   |
| `ADMIN_KEY` | `conquest2025` | Admin panel password |
