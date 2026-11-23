# FolioNexa — Independent Portfolio Studio

**Your identity. Your work. Your world.**

FolioNexa is a standalone portfolio-builder project. It does not reuse the GlobalFolioAI codebase, branding, database, or configuration.

## Included in this release

- Responsive Next.js + TypeScript application with a custom editorial design system.
- Dashboard, profile editor, skills, project case-study editor and live preview.
- Six distinct design directions: The Atelier, Modernist Grid, The Folio, Open Archive, Quiet Practice and Signal.
- Country selector covering 120+ countries/territories, available in profile and design studio.
- Local-first workspace that works without external credentials.
- Sign-in / create-account interface wired to Supabase Auth when configured.
- Supabase profile persistence adapter and independent SQL schema with row-level security.
- Export portfolio as standalone HTML and profile data as JSON.
- Writing companion with local portfolio-writing prompts and improvement guidance.
- Responsive desktop and mobile layouts.

## Requirements

- Node.js 20.9+ (LTS recommended)
- npm
- Optional: a free Supabase project for real accounts and cloud persistence.

## Run locally on Windows

1. Install Node.js LTS from https://nodejs.org/
2. Extract the ZIP to a folder such as `C:\FolioNexa`.
3. Open PowerShell in that folder.
4. Run:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

5. Open http://localhost:3000

The app starts in local demo mode without Supabase. Changes are stored in the browser's local storage. Use the Export controls to keep portable copies.

## Enable real user accounts and cloud persistence

1. Create a new Supabase project at https://supabase.com/.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy the Project URL and anon/public key from Supabase Project Settings → API.
4. Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

5. Restart `npm run dev`.

The sign-in and registration controls then use Supabase email/password authentication. Configure email confirmation and password recovery in Supabase Auth settings. The included RLS policies restrict profile writes to the signed-in owner and permit reads of published profiles. Review the policies and add rate limits, abuse controls and production monitoring before launch.

## Deploy

A simple deployment path is Vercel:

1. Push this folder to a new private Git repository.
2. Import that repository into Vercel.
3. Add the two Supabase environment variables to the Vercel project.
4. Deploy and connect your own domain.

Hosting providers and domains may have costs or usage limits. Review current free-tier terms before publishing.

## Current release boundary — read before public launch

This is a runnable **first complete product foundation / MVP**, not a fully operated SaaS service. The local workspace, profile/project editing, templates, preview and HTML/JSON export work without external accounts. Real multi-user login and cloud persistence require your own Supabase credentials. The public portfolio route is a deployment hook and is not yet wired to fetch published profiles. The country selector provides a country-aware design context, but does not claim that each country has a legally or culturally certified design system. The writing companion is a local guidance assistant, not a connected generative AI model. Image upload, drag-and-drop page composition, PDF export, billing, custom domains, analytics, moderation and full production publishing are not included in this release.

These boundaries are stated explicitly rather than presenting unimplemented services as finished. The architecture is ready to extend those capabilities in a separate development phase.

## Project structure

```text
FolioNexa/
  app/
    portfolio/[slug]/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/FolioStudio.tsx
  lib/
    countries.ts
    storage.ts
    supabase.ts
    types.ts
  supabase/schema.sql
  .env.example
```

## Privacy and security

- Never commit `.env.local`.
- Never expose a Supabase service-role key in browser code.
- Use Supabase Auth and row-level security for user-owned records.
- Configure storage access policies before accepting uploads.
- Review exported portfolio content before sharing publicly.
