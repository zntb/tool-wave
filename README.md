# Tool Wave

A curated collection of design resources for developers. Built with Next.js, this application helps you discover and organize the best design tools, UI frameworks, icons, fonts, and more for your web and mobile projects.

![Project Banner](./headerimage.png)

## ✨ Features

### Browsing & Discovery

- **Curated Categories** — Browse resources organized by type (UI Graphics, CSS Frameworks, Icons, Typography, etc.)
- **Global Search with Autocomplete** — Type 2+ characters to see instant suggestions with keyboard navigation (↑/↓, Enter, Tab, Escape)
- **View Toggle** — Switch between Grid view (3-column cards) and List view (single-column)
- **Sort Options** — Sort by Newest, Most Popular (by clicks), A-Z, or Z-A
- **Pagination** — Navigate through large result sets with URL-persisted page numbers
- **Breadcrumb Navigation** — See your location (e.g., Home > Frontend > React) on category and search pages
- **Empty States** — Friendly illustrations and suggestions when no results are found
- **Search History** — Last 5 searches stored locally and shown as suggestions
- **Category Navigation** — Browse all categories from any page via the header nav

### Resource Cards

- **Click Tracking** — Each resource click is tracked to measure popularity
- **Share Buttons** — Share to Twitter, LinkedIn, Facebook, Reddit, or Email; copy link to clipboard
- **Favorites/Bookmarks** — Save resources with the heart icon; stored in localStorage
- **Quick Preview Modal** — Preview resource details without leaving the page
- **Icon Fallback** — Graceful fallback when resource icons fail to load
- **Tooltip Consistency** — Every icon-only button has a tooltip explaining its action

### Favorites

- **Add/Remove** — Click the heart icon on any resource card
- **View All** — Dedicated favorites page with grid/list toggle
- **Export/Import** — Export favorites as JSON and import on another device
- **Clear All** — Remove all saved resources at once

### Accessibility

- **Skip to Content** — "Skip to main content" link for screen reader users
- **Keyboard Navigation** — `/` to focus search, `Esc` to close menus, arrow keys to navigate cards
- **ARIA Attributes** — Proper `aria-selected`, `aria-label`, `aria-live` regions throughout
- **Focus Ring** — Visible focus indicators on all interactive elements
- **Reduced Motion** — Respects `prefers-reduced-motion` system preference

### UI Polish

- **Dark Mode** — Class-based dark mode with smooth toggle; respects system preference
- **Page Transitions** — Smooth fade/slide animations between routes
- **Loading Skeletons** — Tailored skeletons for grid cards, list items, and category nav
- **Back to Top** — Floating button appears when scrolling past the fold
- **Onboarding Tooltip** — First-visit walkthrough highlighting key features
- **Staggered Animations** — Cards animate in sequentially for a polished feel
- **Print Stylesheet** — Clean print output hiding nav, footer, and decorative elements
- **Responsive Design** — Fully responsive across mobile, tablet, and desktop

### Resource Submission

- **User Submissions** — Public form at `/submit` for anyone to suggest resources
- **Admin Review** — Admins approve or reject submissions via the dashboard
- **Input Sanitization** — Script tags, event handlers, and `javascript:` URIs are stripped before storage

### Admin Dashboard (`/admin`)

- **Manage Resources** — Add, update, and delete categories and links
- **Bulk Import** — Import resources from JSON or CSV files
- **Submissions Review** — Approve or reject user-submitted resources
- **Analytics Dashboard** — View popular resources, popular categories, and daily/weekly/monthly trends
- **Tab Navigation** — Clean tabbed interface (Manage, Bulk Import, Submissions, Analytics)

### Automatic `resources.md` Synchronization

When an admin adds, updates, or deletes a category or link, the [`resources.md`](resources.md) file is automatically updated to keep the source of truth in sync with the database:

- **Create** — New categories and links are appended to `resources.md`
- **Update** — Modified categories and links are updated in `resources.md`
- **Delete** — Removed categories and links are removed from `resources.md`

## 🔒 Security

### Authentication & Session Management

- **Admin Authentication** — Email + password login with secure httpOnly cookies
- **Session Rotation** — New session ID generated on every login to prevent session fixation
- **SameSite=Strict** — Admin cookies use `SameSite=strict` to prevent CSRF via cookie attachment
- **Secure Cookies** — Cookies are marked `secure` in production (Vercel)

### CSRF Protection

- **HMAC-based CSRF Tokens** — Tokens are HMAC signatures of the session cookie, validated on every write operation
- **Automatic Token Rotation** — CSRF tokens are regenerated on login alongside session rotation

### Input Validation & Sanitization

- **Zod Schemas** — All API inputs validated with Zod before processing
- **XSS Prevention** — Script tags, event handlers, and `javascript:` URIs stripped from user input
- **SSRF Prevention** — URLs submitted by users are DNS-resolved and checked against private/internal IP ranges (10.x, 192.168.x, 169.254.x, etc.)
- **Request Size Limits** — Bulk import endpoint rejects payloads over 1 MB

### Rate Limiting

- **API Rate Limits** — Suggestions API limited to 30 requests/minute per IP
- **Submission Rate Limits** — Submission endpoint rate-limited to prevent abuse
- **Retry-After Headers** — Clients receive proper `Retry-After` and `X-RateLimit-Remaining` headers

### Content Security Policy

Strict CSP headers via `next.config.ts`:

- **Script Sources** — Self + inline only (no external scripts)
- **Style Sources** — Self + inline + Google Fonts
- **Image Sources** — Self + data URIs + blob URIs + HTTPS (for remote resource icons)
- **Frame Protection** — `frame-ancestors: none` prevents clickjacking
- **HSTS** — `Strict-Transport-Security` with 2-year max-age, includeSubDomains, and preload
- **Additional Headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`

### Environment Variable Validation

- **Startup Validation** — Zod schema validates all required env vars (`DATABASE_URL`, `ADMIN_EMAILS`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`) at first use
- **Fail Fast** — Clear error messages if any variable is missing or malformed
- **`.env` Excluded** — `.env` is in `.gitignore` and never committed

### Error Boundaries

- **Route-level Error Boundaries** — Each route has its own error boundary so a crash in one page doesn't blank the entire app
- **Friendly Fallbacks** — "Something went wrong" message with retry and go-home buttons

### Structured Logging

- **Logger Module** — All server-side logging goes through `lib/logger.ts` with timestamps, severity levels, and context tags
- **No `console.error` in Client** — All error logging uses the structured logger

## 🔄 CI/CD Automation

This project uses GitHub Actions for automated database seeding:

- **Trigger** — Auto-runs when PR merging to master (with `resources.md` changes) is approved and merged
- **Condition** — Only executes when [`resources.md`](resources.md) is modified
- **Action** — The seed script automatically updates the database with new resources from `resources.md`

### Adding New Resources

1. Add new resources to the appropriate category in [`resources.md`](resources.md)
2. Create a pull request to `master`
3. After review and approval, merge the PR
4. The CI/CD workflow will automatically seed the database

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Database | [MongoDB](https://www.mongodb.com) with [Prisma](https://www.prisma.io) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| UI Components | [Radix UI](https://www.radix-ui.com) + [shadcn/ui](https://ui.shadcn.com) |
| Icons | [Lucide React](https://lucide.dev) |
| Validation | [Zod](https://zod.dev) |
| Toast Notifications | [Sonner](https://sonner.emilkowal.dev) |
| Dark Mode | [next-themes](https://github.com/pacocoursey/next-themes) |
| Animations | CSS keyframes + Tailwind |

## 📋 Prerequisites

- **Node.js** (v18 or later)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or Atlas)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tool-wave
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="mongodb://localhost:27017/link-organizer"
# Or for MongoDB Atlas:
# DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/link-organizer"

ADMIN_EMAILS="admin@example.com"
ADMIN_PASSWORD="your-secure-password-min-8-chars"
ADMIN_SESSION_SECRET="your-session-secret-min-16-chars"
```

### 4. Database Setup

```bash
npx prisma generate
npm run seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔍 Search Features

- **Autocomplete** — Suggestions appear after 2+ characters with keyboard navigation (↑/↓/Enter/Tab/Escape)
- **Full Search** — Press Enter or click Search for category-organized results
- **Category Filter** — Search within a specific category from the category page
- **Search History** — Last 5 queries shown as suggestions when the input is focused
- **Clear** — Click the X button to clear and return home

## ❤️ Favorites

- **Add/Remove** — Click the heart icon on any resource card
- **View All** — Click the heart icon in the header to see your favorites
- **Export** — Download favorites as a JSON file
- **Import** — Upload a JSON file to merge favorites from another device
- **Clear All** — Use the "Clear all" button on the favorites page

Favorites are stored in `localStorage` and persist across sessions.

## 🔐 Admin Dashboard

Navigate to `/admin/login` and enter your admin credentials.

### Features

- **Manage** — Add/update/delete categories and links with search filtering
- **Bulk Import** — Import from JSON or CSV format
- **Submissions** — Review and approve/reject user-submitted resources
- **Analytics** — Popular resources, popular categories, daily/weekly/monthly trends

### Bulk Import Format

**JSON:**
```json
[
  {
    "title": "Resource Name",
    "url": "https://example.com",
    "description": "Description",
    "category": "Category Name"
  }
]
```

**CSV:**
```
title,url,description,category
Resource Name,https://example.com,Description,Category Name
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/suggestions` | GET | Autocomplete suggestions (rate-limited: 30/min) |
| `/api/submissions` | GET | List submissions (admin only) |
| `/api/submissions` | POST | Submit a resource |
| `/api/submissions` | PATCH | Update submission status (admin + CSRF) |
| `/api/submissions` | DELETE | Delete submission (admin + CSRF) |
| `/api/bulk-import` | POST | Bulk import resources (admin + CSRF) |
| `/api/analytics` | GET | Analytics data (admin only) |
| `/api/admin/check` | GET | Check admin authentication status |
| `/api/admin/logout` | POST | Logout admin |
| `/api/health` | GET | Database health check |

## Project Structure

```
├── app/                        # Next.js App Router
│   ├── actions.ts              # Server actions (CRUD, search, tracking)
│   ├── layout.tsx              # Root layout (ThemeProvider, Header, Footer)
│   ├── page.tsx                # Home page
│   ├── error.tsx               # Root error boundary
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Global styles, dark mode, animations
│   ├── search/page.tsx         # Global search results
│   ├── favorites/page.tsx      # Favorites page
│   ├── submit/page.tsx         # Resource submission form
│   ├── [slug]/page.tsx         # Category pages
│   ├── [slug]/search/page.tsx  # Category search results
│   ├── admin/                  # Admin dashboard
│   │   ├── page.tsx
│   │   ├── login/page.tsx
│   │   └── logout/page.tsx
│   └── api/                    # API routes
│       ├── suggestions/        # Autocomplete (rate-limited)
│       ├── submissions/        # Resource submissions
│       ├── bulk-import/        # Bulk import (admin + CSRF)
│       ├── analytics/          # Analytics (admin only)
│       ├── admin/              # Auth check, logout
│       └── health/             # Database health check
├── components/                 # React components
│   ├── header.tsx              # Header with search, nav, theme toggle
│   ├── mobile-nav-drawer.tsx   # Mobile slide-out navigation
│   ├── theme-toggle.tsx        # Dark mode pill toggle
│   ├── link-card.tsx           # Resource card (grid + list views)
│   ├── link-grid.tsx           # Grid/list layout wrapper
│   ├── share-buttons.tsx       # Social sharing dropdown
│   ├── favorites-button.tsx    # Heart icon favorite toggle
│   ├── favorites-client.tsx    # Favorites page client logic
│   ├── autocomplete.tsx        # Search autocomplete dropdown
│   ├── search-input.tsx        # Reusable search input
│   ├── category-nav.tsx        # Category navigation tabs
│   ├── category-nav-server.tsx # Server component with Suspense
│   ├── sort-dropdown.tsx       # Sort order dropdown
│   ├── view-toggle.tsx         # Grid/list view toggle
│   ├── view-sort-controls.tsx  # Combined view + sort controls
│   ├── pagination-controls.tsx # Page navigation
│   ├── breadcrumbs.tsx         # Breadcrumb navigation
│   ├── empty-state.tsx         # Reusable empty state
│   ├── page-layout.tsx         # Page layout wrapper
│   ├── background-pattern.tsx  # Decorative dot grid
│   ├── footer.tsx              # Site footer
│   ├── back-to-top.tsx         # Floating back-to-top button
│   ├── page-transition.tsx     # Route transition animations
│   ├── onboarding-tooltip.tsx  # First-visit walkthrough
│   ├── route-error.tsx         # Error boundary fallback UI
│   ├── icon-fallback.tsx       # Graceful icon fallback
│   ├── tab-bar.tsx             # Reusable tab navigation
│   ├── skeletons.tsx           # Loading skeleton components
│   ├── json-ld.tsx             # Structured data for SEO
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   ├── select.tsx
│   │   ├── textarea.tsx
│   │   ├── tooltip.tsx
│   │   └── badge.tsx
│   └── admin/                  # Admin-specific components
│       ├── AdminPageContent.tsx
│       ├── AdminSearchInput.tsx
│       ├── AnalyticsDashboard.tsx
│       ├── BulkImportForm.tsx
│       ├── SubmissionsReview.tsx
│       ├── AdminForms.tsx
│       └── FormToastHandler.tsx
├── lib/                        # Utilities and data layer
│   ├── data.ts                 # Database queries (Prisma)
│   ├── db.ts                   # Prisma client singleton
│   ├── types.ts                # Shared TypeScript types
│   ├── utils.ts                # Utility functions (cn, parseSearchParams, etc.)
│   ├── schemas.ts              # Zod validation schemas
│   ├── logger.ts               # Structured logging
│   ├── env.ts                  # Environment variable validation
│   ├── admin-auth.ts           # Session management, auth helpers
│   ├── csrf.ts                 # CSRF token generation/validation
│   ├── rate-limit.ts           # In-memory rate limiting
│   ├── sanitize.ts             # Input sanitization (XSS prevention)
│   ├── ssrf-prevention.ts      # SSRF prevention (DNS resolution check)
│   ├── analytics.ts            # Analytics data aggregation
│   ├── favorites-storage.ts    # localStorage favorites helper
│   ├── fetch-with-retry.ts     # Fetch with exponential backoff
│   ├── resources-md.ts         # resources.md file sync
│   └── hooks/                  # Custom React hooks
│       ├── use-favorites.ts
│       ├── use-click-outside.ts
│       ├── use-copy-to-clipboard.ts
│       ├── use-csrf-token.ts
│       ├── use-keyboard-navigation.ts
│       ├── use-mounted.ts
│       ├── use-scroll-reveal.ts
│       ├── use-search-history.ts
│       └── use-search-navigation.ts
├── prisma/                     # Database schema and seed
│   ├── schema.prisma
│   └── seed.ts
├── scripts/                    # Utility scripts
│   ├── db-export-import.ts     # Database backup/restore
│   └── export-to-md.ts        # Export DB to resources.md
├── e2e/                        # Playwright end-to-end tests
├── public/                     # Static assets
├── next.config.ts              # Next.js config (CSP headers, image domains)
├── middleware.ts               # (none — headers handled in next.config.ts)
├── postcss.config.mjs          # PostCSS config (Tailwind v4)
└── package.json
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run Jest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run seed` | Seed the database |
| `npx prisma studio` | Open Prisma database GUI |

## 💾 Database Backup & Restore

### Export
```bash
npx tsx scripts/db-export-import.ts export
```

### Import
```bash
npx tsx scripts/db-export-import.ts import --file=./db-backup.json
```

### Import with Clear
```bash
npx tsx scripts/db-export-import.ts import --file=./db-backup.json --clear
```

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables:
   - `DATABASE_URL` — MongoDB connection string
   - `ADMIN_EMAILS` — Comma-separated admin email addresses
   - `ADMIN_PASSWORD` — Admin login password (min 8 chars)
   - `ADMIN_SESSION_SECRET` — Session signing secret (min 16 chars)
4. Deploy

### Self-Hosted

```bash
npm run build
npm run start
```

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](./contributing.md) before submitting a pull request.

### Guidelines

- Add one resource per pull request for easier review
- Include resource name and category in the PR title
- Verify the resource is free to use
- Check if the resource already exists before adding

## 🙏 Acknowledgments

- Thanks to all contributors who help maintain this resource collection
- Built with the amazing Next.js and React ecosystem
