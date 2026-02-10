# Deploy From Scratch (Render + Vercel)

This guide deploys:
- Backend API on Render
- Frontend on Vercel
- MongoDB on MongoDB Atlas

## 1. Prerequisites

- GitHub repo pushed
- Render account
- Vercel account
- MongoDB Atlas account
- Optional: Hugging Face token for AI features

## 2. Create MongoDB Atlas Database

1. Create a free cluster in Atlas.
2. Create a database user.
3. Add a network rule:
- `0.0.0.0/0` for quick setup (tighten later)
4. Copy connection string and replace `<password>`.

Example:
`mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/second-brain?retryWrites=true&w=majority`

## 3. Deploy Backend on Render

### Option A: Using Blueprint (`render.yaml`) from this repo

1. In Render, click `New` -> `Blueprint`.
2. Connect your GitHub repo.
3. Select branch (usually `main`).
4. Render reads `render.yaml` and creates `second-brain-api`.
5. Set secret env vars in Render dashboard:
- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN` (your Vercel frontend URL)
- `PUBLIC_API_BASE_URL` (your Render API URL + `/api/v1`)
- `PUBLIC_APP_BASE_URL` (your Vercel URL)
- `HF_API_TOKEN` (optional)
6. Deploy and wait for build to complete.
7. Verify health endpoint:
- `https://<your-render-service>.onrender.com/`

### Option B: Manual Render service

Create a `Web Service` with:
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Runtime: Node 20

Set the same environment variables as above.

## 4. Deploy Frontend on Vercel

1. In Vercel, click `Add New...` -> `Project`.
2. Import your GitHub repository.
3. Configure:
- Framework Preset: `Create React App` (auto-detected)
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `build`
4. Add environment variables:
- `REACT_APP_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`
- `REACT_APP_PUBLIC_APP_BASE_URL=https://<your-vercel-app>.vercel.app`
5. Deploy.

`frontend/vercel.json` already includes SPA rewrite to `index.html`.

## 5. Wire Domains Correctly

After first deploy, update backend env vars in Render:
- `CORS_ORIGIN=https://<your-vercel-app>.vercel.app`
- `PUBLIC_APP_BASE_URL=https://<your-vercel-app>.vercel.app`
- `PUBLIC_API_BASE_URL=https://<your-render-service>.onrender.com/api/v1`

Then redeploy backend.

## 6. Post-Deploy Smoke Test

1. Open frontend URL.
2. Create account and login.
3. Add one link content item.
4. Create share link and open it in incognito.
5. Confirm API call:
- `GET https://<your-render-service>.onrender.com/api/v1/content` (with auth token in app flow)

Optional automated check:

```bash
cd backend
$env:SMOKE_BASE_URL='https://<your-render-service>.onrender.com/api/v1'
npm run smoke:stage
```

## 7. Common Issues

- `CORS error`: `CORS_ORIGIN` mismatch in Render env.
- `401 unauthorized`: stale token in browser local storage after secret/domain changes.
- `Mongo connection failed`: wrong Atlas URI or IP access list.
- `Frontend cannot call API`: wrong `REACT_APP_API_BASE_URL` in Vercel project env.
- `Share link points to localhost`: missing `PUBLIC_APP_BASE_URL` on backend.
