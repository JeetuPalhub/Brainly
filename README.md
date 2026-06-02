# SecondBrain - Personal Knowledge Base

[![Live Demo](https://img.shields.io/badge/Live-Demo-20E3B2?style=flat-square)](https://brainly-neon.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

Save links, notes, YouTube videos, tweets, and documents to your second brain. Organise with collections, search semantically, and share your brain with a public link.

**Live:** [brainly-neon.vercel.app](https://brainly-neon.vercel.app)

---

## Screenshots

### Landing
![Landing page](https://raw.githubusercontent.com/jeetupal31/secondBrain/main/assets/screenshots/landing-page.png)

### Dashboard
![Dashboard - dark](https://raw.githubusercontent.com/jeetupal31/secondBrain/main/assets/screenshots/dashboard-dark.png)

![Dashboard - light](https://raw.githubusercontent.com/jeetupal31/secondBrain/main/assets/screenshots/dashboard-light.png)

---

## Features

**Core**
- Save links, notes, YouTube videos, Twitter/X threads, and documents
- Tag content by topic for quick retrieval
- Group content into named collections
- Generate a public read-only shareable link for your brain
- JWT-authenticated — your notes stay private by default

**AI-Powered (HuggingFace)**
- Auto tag suggestions using  (zero-shot classification)
- Content summarization using 
- Semantic search with vector embeddings ()
- Duplicate content detection via cosine similarity (threshold: 0.88)
- Deterministic fallback embeddings when HuggingFace is unavailable
- AI response caching with configurable TTL (reduces API calls)

**UX**
- Infinite scroll with 
- Animated UI with Framer Motion + Aceternity components (Spotlight, 3D cards, moving borders)
- Dark / light theme toggle
- AI chat interface for querying your saved content
- Skeleton loading states

**Backend**
- Custom in-memory rate limiter (configurable window + max requests)
- Security headers (X-Content-Type-Options, X-Frame-Options, XSS protection)
- Auto metadata fetching on URL save (title + preview)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Tailwind CSS, Framer Motion, TanStack Query |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB + Mongoose |
| AI | HuggingFace Inference API (BART, BGE embeddings) |
| Auth | JWT, bcrypt |
| Hosting | Vercel (frontend), Render (backend) |

---

## Architecture



---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST |  | Create account |
| POST |  | Sign in, returns JWT |

### Content (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET |  | Get all content (paginated) |
| POST |  | Add new content |
| PUT |  | Update content |
| DELETE |  | Delete content |

### Collections (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET |  | List collections |
| POST |  | Create collection |
| DELETE |  | Delete collection |

### Brain Sharing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST |  | Generate shareable link |
| GET |  | View shared brain (public) |

---

## Local Setup

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- HuggingFace API token (optional — AI falls back to deterministic mode)

### 1. Clone and install



### 2. Backend



### 3. Frontend



Open [http://localhost:3001](http://localhost:3001)

---

## Environment Variables

### Backend ()
| Variable | Description | Default |
|----------|-------------|---------|
|  | MongoDB connection string | required |
|  | Secret for JWT signing | required |
|  | Server port |  |
|  | Allowed frontend origin |  |
|  | HuggingFace API token (AI features) | optional |
|  | Zero-shot model for tags |  |
|  | Summarization model |  |
|  | Embedding model |  |
|  | Cosine similarity threshold |  |
|  | AI response cache duration |  (14 days) |
|  | Max requests per window |  |

---

**Author:** [Jeetu Pal](https://github.com/jeetupal31)
