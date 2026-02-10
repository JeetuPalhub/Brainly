# Free AI Setup (Hugging Face + Mongo Cache)

## 1. Get a free Hugging Face token (no credit card)
1. Create/login account at https://huggingface.co/join
2. Go to https://huggingface.co/settings/tokens
3. Create a token with `Read` scope
4. Copy token (`hf_...`)

## 2. Configure backend environment
Update `backend/.env` using `backend/.env.example` values:

```env
HF_API_TOKEN=hf_your_token_here
HF_API_URL=https://router.huggingface.co/hf-inference/models
HF_TAG_MODEL=facebook/bart-large-mnli
HF_SUMMARY_MODEL=facebook/bart-large-cnn
HF_EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
AI_CACHE_TTL_HOURS=336
AI_DUPLICATE_THRESHOLD=0.88
```

## 3. Start app
```bash
# backend
cd backend
npm run dev

# frontend
cd ../frontend
npm start
```

## 3b. Staging environment
Use env-based URLs so stage works end-to-end:

Backend (`backend/.env`):
```env
PUBLIC_API_BASE_URL=https://your-stage-api-domain/api/v1
CORS_ORIGIN=https://your-stage-frontend-domain
```

Frontend (`frontend/.env`):
```env
REACT_APP_API_BASE_URL=https://your-stage-api-domain/api/v1
```

Then run:
```bash
cd backend && npm run smoke:stage
```
Or against deployed stage (PowerShell):
```bash
cd backend
$env:SMOKE_BASE_URL='https://your-stage-api-domain/api/v1'
npm run smoke:stage
```

## 4. Use features
- Add Content modal: click `Auto-Tag + Summarize (Free AI)`.
- Dashboard search: enable `Semantic search (AI)`.
- Duplicate detection runs during AI suggestion and content creation.
- All Hugging Face outputs are cached in MongoDB collection `aicaches`.

## Rate-limit behavior
- If Hugging Face returns 429/503/errors, app falls back to local rule-based logic.
- Fallback responses are also cached.
- UI shows fallback source when used.
