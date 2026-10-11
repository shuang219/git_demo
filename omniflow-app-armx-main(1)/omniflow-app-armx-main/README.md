# AI 视觉辅助盲人出行系统

Fullstack app (React + Vite + Tailwind v4 + shadcn/ui, Express + Drizzle/Postgres).

## Structure
- `frontend/src/App.tsx` — HashRouter routes: `/login`, `/signup`, `/profile` (protected), `/` (protected main app), `/d919503a-2314-4eee-80ee-dd1a29c7a34b` (public preview page), `*` (NotFound with recovery links).
- `frontend/src/pages/Index.tsx` — main assistant: simulated real-time detection with voice announcements, AI voice chat, SOS, bottom nav.
- `frontend/src/pages/Preview.tsx` — public product preview page.
- `frontend/src/pages/NotFound.tsx` — wildcard fallback.
- `frontend/src/pages/Profile.tsx` — profile and password management.
- `frontend/src/components/custom/` — Login, Signup, NavBar, AIChatPanel, DetectionOverlay, SOSButton, VoiceIndicator, OmniflowBadge.
- `frontend/src/contexts/AuthContext.tsx` — JWT auth state (token in localStorage).
- `backend/routes/` — `auth.ts`, `ai.ts` (SSE chat via AIService), `speech.ts`.
- `shared/types/api.ts` — shared API types.

## Guidelines
- Hash routing only; auth-protected routes redirect to `/login`.
- Use `@shared/types/api` for shared types; AI via `createAIService()` only.
- Deferred features: map navigation, contacts management, OCR, family tracking.
