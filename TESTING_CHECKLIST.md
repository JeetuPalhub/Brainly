# Second Brain Testing Checklist

Use this checklist before every release candidate.

## 1) Environment and startup

- [ ] `backend/.env` exists and contains valid values (`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`).
- [ ] Backend builds: `cd backend && npm run build`.
- [ ] Frontend type-check passes: `cd frontend && npx tsc --noEmit`.
- [ ] App boots with no runtime errors:
  - [ ] `cd backend && npm run dev`
  - [ ] `cd frontend && npm start`

## 2) Authentication

- [ ] Signup works with valid username/password.
- [ ] Signup rejects weak passwords and invalid usernames.
- [ ] Login works with valid credentials.
- [ ] Login rejects invalid credentials.
- [ ] Logout clears auth state and redirects to login.

## 3) Core content flows

- [ ] Add content works for each type (`document`, `tweet`, `youtube`, `link`).
- [ ] Edit content updates fields correctly.
- [ ] Delete content removes item and shows notification.
- [ ] Search returns matches from title, link, tags, and metadata.

## 4) Collections

- [ ] Create collection from sidebar.
- [ ] Assign content to collection on add/edit.
- [ ] Filter by collection in sidebar.
- [ ] Delete collection unassigns content (does not delete content).

## 5) Metadata preview

- [ ] Add modal fetches URL preview metadata.
- [ ] Title auto-fills when metadata title is available.
- [ ] Saved cards show thumbnail/site/description when metadata exists.
- [ ] Metadata preview failures show graceful message (no crash).

## 6) Import feature

- [ ] JSON import works with valid array payload.
- [ ] CSV import works with required `link` column.
- [ ] Mixed valid/invalid rows import partially with failure reporting.
- [ ] Imported items appear in dashboard after import.

## 7) Sharing and links

- [ ] Share link generation works.
- [ ] Copy link button works.
- [ ] Shared brain endpoint returns public content.

## 8) Notifications + dark mode + responsiveness

- [ ] Success/error/info toasts appear for major actions.
- [ ] Dark mode toggle persists across refresh.
- [ ] Sidebar drawer works on mobile.
- [ ] Header/actions/cards are usable on small screens.
- [ ] Add/Edit/Import modals are usable on mobile.

## 9) Regression checks

- [ ] No browser console errors during normal usage.
- [ ] Backend logs do not show uncaught exceptions.
- [ ] Existing old records render correctly with new metadata fields.

## 10) AI feature checks (free tier)

- [ ] Add modal `Auto-Tag + Summarize (Free AI)` returns tags and summary.
- [ ] New content save response includes `ai` payload and duplicate candidates.
- [ ] Semantic search toggle returns ranked results for intent-based query.
- [ ] Duplicate warning appears for clearly similar content.
- [ ] MongoDB `aicaches` collection gets entries with TTL `expiresAt`.
- [ ] Hugging Face failure/rate-limit still returns fallback AI response.
