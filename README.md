# Kartik Khandelwal — MERN Portfolio

A responsive, skate-inspired personal portfolio. Cream and neon visual theme, custom SVG skater, checkpoint navigation, skateboard project cards, wheel-shaped skills and dark mode.

## Current status

- React frontend implemented and production build verified.
- Express/Mongoose contact API implemented; request validation and error paths tested with an injected persistence function.
- PDF and DOCX downloads implemented through Express and verified for file signatures and attachment headers.
- Real MongoDB storage has NOT been tested in this environment: a database URI is required.
- Hosted design preview: https://kartik-khandelwal-portfolio.blondmoose32.chatgpt.site (owner-private; frontend only).
- Required final public frontend URL: **add after Vercel/Netlify deployment**.
- Required final public backend URL: **add after Render/Railway deployment**.
- Public GitHub repository: **create/upload and add link**.

The preview is not a complete assignment deployment. Contact displays an honest unavailable notice when no production API origin is configured. The preview downloads the actual resume as static files; configuring VITE_API_URL switches downloads to Express routes. Static preview downloads do not by themselves satisfy the backend download requirement. They do not simulate successful submissions.

## Local setup (Node 20.19+ or 22.12+)

From the project root:

```bash
npm ci
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Set `MONGODB_URI` in `server/.env` to a local MongoDB or Atlas URI. Keep it private. For local use keep `CLIENT_ORIGIN=http://localhost:5173` and leave `VITE_API_URL` blank so Vite proxies `/api` to Express.

Start both frontend and backend from one terminal:
```bash
npm run dev
```

Visit the address printed by Vite (normally http://localhost:5173).

```bash
npm test
npm run build
```

## Structure

- `client/src/main.jsx` — React components, routes, interactions and API calls
- `client/src/content.js` — profile, projects, certificates and editable skill self-assessments
- `client/src/style.css` — responsive theme and CSS animations
- `server/src/app.js` — Express REST API, Mongoose model, validation, CORS and rate limiting
- `server/src/index.js` — database connection and server lifecycle
- `server/src/resume.js` — starter resume content and PDF/DOCX generation
- `server/files/` — optional final PDF/DOCX overrides
- `server/src/app.test.js` — meaningful API tests; these do not prove live database connectivity

## API

| Method | Route | Behavior |
| --- | --- | --- |
| GET | `/api/health` | 200 when connected to MongoDB, 503 otherwise |
| POST | `/api/contact` | Validates name, email and message; saves via Mongoose; returns 201 only after save |
| GET | `/api/resume/pdf` | Downloads PDF via Express |
| GET | `/api/resume/docx` | Downloads Word file via Express |

Contact validation: name 2–80 characters, email up to 254 characters, message 10–3000 characters. Only allowed fields are saved. Includes CORS allowlist, Helmet headers, a hidden spam field and a 10-request/15-minute limit. Rate limiting uses process memory; multi-instance production deployments should use a shared store.

## Personalize before submission

1. In `client/src/content.js`, add your photo path, email, GitHub, LinkedIn and actual education years. The supplied photo, email and education dates are already included.
2. Add genuine GitHub repository and live demo URLs for **all four projects**. Null links intentionally display as pending. Project descriptions reflect shared plans/prototypes; review them against your actual implementation.
3. Add real earned certificates to the `certificates` array with `{title,issuer,date,url,image}`. The DBMS academic certification reported in the supplied resume is listed; a verification link or image is still needed.
4. Review skills. Levels are initial self-assessments to edit, not externally verified scores.
5. Update the starter resume in `server/src/resume.js`, or place final files at `server/files/Kartik_Khandelwal_Resume.pdf` and `server/files/Kartik_Khandelwal_Resume.docx`. These override generated content automatically. Add your verified contact details, dates and links.

## Deploy the assignment

### Express on Render (or Railway)

Push this repository to your own public GitHub account. Render configuration is included in `render.yaml`.

- Root directory: repository root
- Build: `npm ci`
- Start: `npm run start --workspace server`
- Set `MONGODB_URI` as a secret, `NODE_ENV=production`, and `CLIENT_ORIGIN` to your exact deployed frontend origin.
- `/api/health` must return `{"status":"ok"}`.
- Configure MongoDB Atlas network access for your backend host. Never commit credentials.

### React on Vercel

Import the same repository with the repository root as the root directory. `vercel.json` supplies the build command, output directory and SPA rewrite. Set `VITE_API_URL` to your Express HTTPS origin before the build. Redeploy whenever that variable changes.

### React on Netlify (alternative)

Use repository root, build `npm run build`, publish `dist`. `netlify.toml` includes SPA fallback. Set `VITE_API_URL` before building.

Update the backend `CLIENT_ORIGIN` to the frontend origin (comma-separated exact origins are supported). Do not include a trailing slash.

## Final verification and submission

- Test mobile, tablet, desktop, light/dark mode, keyboard navigation and project dialogs.
- Submit a real contact message; confirm it appears in the MongoDB `contacts` collection.
- Download and open both resume formats from the deployed frontend.
- Verify every project repository/demo and certificate link.
- Add frontend/backend public URLs to this README.
- Keep `.env` and `node_modules` excluded; `.env.example` is safe to commit.
- Use meaningful commits while personalizing; submit the **public GitHub repository link** in Classroom by **20 October 2026**.

## Assignment mapping

| Requirement | Implementation / remaining action |
| --- | --- |
| Hero animation & CV CTA | Implemented |
| About, location, student status, scroll animation | Implemented; supplied photo added |
| Categorized animated skills and tooltips | Implemented; review self-assessments |
| At least three project cards, descriptions, stack badges | Implemented; real GitHub/live links needed |
| PDF + DOCX via Express | Implemented/tested; updated resume files installed; deploy API |
| Animated education/experience timeline | Implemented; study years added |
| Certificates/achievements | Section implemented; real certificate proof needed |
| Contact → Express → MongoDB/Mongoose | Implemented; live database configuration and test needed |
| React Router, responsive design, light/dark toggle | Implemented; browser visual QA pending |
| Both frontend and backend publicly deployed | Pending user hosting/database accounts |
| Public GitHub, README, organized source, ignored secrets | Files ready; public repository still needed |

Design inspired by the user-provided Raghav Goel portfolio; the implementation and SVG illustration were created afresh. His personal content, work claims, certificates and contact information are not reused.

## Personalization update
Photo, education dates, email, Ashoka/Wello experience, fitness interests, UniShare project and reviewed PDF/DOCX resume files are included. Real GitHub/LinkedIn profile URLs, project demos/repos, certificate proof and cloud deployment remain to be supplied or connected.

## Security fixes

- Removed public `GET /api/contact`. It now returns 404; contact messages can be inspected using authenticated MongoDB Atlas/Compass access.
- `POST /api/contact` remains available for visitors and retains validation and rate limiting.
- Private `.env` files are excluded from this archive. Copy the `.env.example` files as described above and configure your database URI privately.
- If a previous database password was committed or publicly shared, rotate it in Atlas. Removing a file does not revoke an exposed password.
- Empty contact requests return 400 instead of a server error.
- API tests use injected persistence; they do not establish live Atlas connectivity.

Validation of this revision: 3 API tests passed, Vite production build passed, and dependency lockfile regenerated. Live database connectivity remains unverified.
