# Notes App (Django + Next.js)

A simple, clean notes app per the challenge demo: signup/login, default categories, instant note creation, autosave edits, category filtering, and Today/Yesterday/Mon D date display.

## What’s Included
- Backend: Django REST API with Token auth, categories and notes CRUD
- Frontend: Next.js (App Router) UI — auth, notes list, editor with autosave

## Prerequisites
- Python 3.10+
- Node.js 18+

## Quick Start

Backend
- cd backend
- python -m venv .venv && source .venv/bin/activate
- pip install -r requirements.txt
- (optional) export DJANGO_SECRET_KEY=your-secret
- python manage.py makemigrations && python manage.py migrate
- python manage.py runserver 0.0.0.0:8000

Frontend
- cd frontend
- cp .env.local.example .env.local (edit if API URL differs)
- npm install
- npm run dev
- Open http://localhost:3000

## Environment
- Backend
  - DJANGO_SECRET_KEY (optional for dev)
  - CORS allowed origins configured in `backend/notes_api/settings.py` — update for your domains
- Frontend
  - NEXT_PUBLIC_API_URL (default http://localhost:8000/api)

## File Layout
- backend/ — Django project `notes_api/` and app `notes/`
- frontend/ — Next.js app (App Router) under `app/`, helpers in `lib/`, static assets in `public/`

## Features and Flow
- Signup/login with email + password (show/hide toggle)
- Default categories created per user: Random Thoughts, School, Personal
- Empty state with dashed tile CTA if no notes
- “New note” creates immediately (no manual save), opens editor
- Editor autosaves title/content/category with debounce; “Last edited” updates live
- Category dropdown changes editor background tint to category color
- Notes list with sidebar categories (colors + counts), filterable including “All categories”
- Preview cards show formatted date (Today/Yesterday/Mon D), category, title, truncated content

## API Summary
- POST /api/auth/register/ { email, password } → { user, access, refresh }
- POST /api/auth/login/ { email, password } → { user, access, refresh }
- POST /api/auth/token/refresh/ { refresh } → { access }
- GET  /api/auth/me/ → current user (requires Bearer access token)
- GET  /api/categories/ → list categories with note_count
- GET  /api/notes/?category=… → list notes
- POST /api/notes/ { title?, content?, category? } → create note
- GET  /api/notes/:id/ → retrieve note
- PATCH /api/notes/:id/ { title?, content?, category? } → update
- DELETE /api/notes/:id/ → delete

Auth: Use JWT `Authorization: Bearer <access>`; refresh tokens at `/api/auth/token/refresh/`.

## Assets (Images & Icons)
- Place static images/icons in `frontend/public/`
  - Recommended: `frontend/public/images/…` and `frontend/public/icons/…`
- Usage in Next.js
  - import Image from 'next/image'
  - <Image src="/images/example.png" width={297} height={296} alt="Example" />
- If you later add image uploads, configure Django media (see below)

## Optional: Media Uploads (future enhancement)
- In `backend/notes_api/settings.py` add:
  - MEDIA_URL = '/media/'
  - MEDIA_ROOT = BASE_DIR / 'media'
- In `backend/notes_api/urls.py`, append static() for dev serving
- Add Pillow to backend requirements and an ImageField model + upload endpoint
- In Next.js, upload via FormData and render returned media URLs

## Production Notes
- Backend: set a strong DJANGO_SECRET_KEY, configure ALLOWED_HOSTS and CORS_ALLOWED_ORIGINS
- Frontend: npm run build && npm start; set NEXT_PUBLIC_API_BASE to prod API

## Troubleshooting
- 401 Unauthorized: token missing/expired → log in again; confirm `NEXT_PUBLIC_API_BASE` and CORS origins
- Migrations: run makemigrations + migrate after model changes
- Styling: global tokens live in `frontend/app/globals.css` (accent #9747FF); dashed borders use inline SVG for exact dash pattern
