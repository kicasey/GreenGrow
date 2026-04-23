# Deploying GreenGrow to Heroku

One Heroku dyno serves **both** the ASP.NET Core API and the built React
frontend as static files, so there's a single URL, no CORS, and one deploy.

The repo already has all the plumbing wired up:

| File | Purpose |
|------|---------|
| `/package.json` | Tells the Heroku nodejs buildpack to run `heroku-postbuild`, which builds the frontend and copies `frontend/dist/*` into `backend/wwwroot/`. |
| `/Procfile` | `web: cd $HOME/heroku_output && dotnet GreenGrow.Api.dll` |
| `/app.json` | Declares the multi-buildpack (`heroku/nodejs` + `jincod/dotnetcore-buildpack`), the JawsDB addon, and `PROJECT_FILE=backend/GreenGrow.Api.csproj` so the dotnet build ignores the stray root `GreenGrow.csproj`. |
| `/backend/Program.cs` | Adds `UseDefaultFiles` + `UseStaticFiles` + `MapFallbackToFile("index.html")` so the dyno serves the SPA. |
| `/backend/wwwroot/.gitkeep` | Placeholder so the static-file folder exists in git; the Heroku build overwrites its contents. |
| `/frontend/src/vite-env.d.ts` | Fixes a TS error on `import.meta.env` that would otherwise break the Vite build. |

## Step 1 — release the git lock and review changes

1. **Close VS Code and Cursor entirely.** They hold a lock on `.git/index.lock`
   that blocks commits. Fully quit the apps (not just the window).
2. In File Explorer, delete `C:\Users\shado\Documents\mis321\GreenGrow\.git\index.lock`
   if it still exists.
3. Open a terminal in the repo root (`C:\Users\shado\Documents\mis321\GreenGrow`).
4. Run `git status`. You should see:
   - **New files** — `Procfile`, `app.json`, `package.json`, `DEPLOY.md`,
     `backend/wwwroot/.gitkeep`, `frontend/src/vite-env.d.ts`,
     `database/database_creation_queries.sql`,
     `database/data_loading_queries.sql`,
     `database/data_analysis_queries.sql`,
     `database/project_description.docx`.
   - **Modified** — `backend/Program.cs`, `.gitignore`, `frontend/.gitignore`.
   - **Modified (noise, revert these)** — `GreenGrow.csproj`, `GreenGrow.sln`,
     `Program.cs` at the repo root, and the `backend/Migrations/*` files.
     Those only show CRLF / LF line-ending differences, not real edits.
     Revert them with:
     ```bash
     git checkout HEAD -- GreenGrow.csproj GreenGrow.sln Program.cs backend/Migrations
     ```

## Step 2 — commit

```bash
git add .
git commit -m "Add Heroku deploy plumbing and MIS 330 deliverable SQL files"
git push origin main
```

## Step 3 — create / verify the Heroku app

You already have a JawsDB database (you've been running local EF migrations
against its AWS RDS hostname). JawsDB only exists as a Heroku addon, so there
is already a Heroku app somewhere that owns it.

```bash
# Log in and list your apps:
heroku login
heroku apps

# If you see the JawsDB app, use it. Otherwise create one and attach JawsDB:
heroku create greengrow-mis330     # pick any available name
heroku addons:create jawsdb:kitefin --app greengrow-mis330
```

## Step 4 — point Heroku at this repo

Option A — git push deploy (simplest):

```bash
heroku git:remote --app greengrow-mis330
git push heroku main
```

Option B — connect the GitHub repo in the Heroku dashboard and click "Deploy
branch: main". This auto-builds from the `kicasey/GreenGrow` repo.

## Step 5 — set config vars

Only needed the first time; `app.json` already declares the same values but
those only apply to "Deploy to Heroku" button flows.

```bash
heroku config:set PROJECT_FILE=backend/GreenGrow.Api.csproj --app greengrow-mis330
heroku config:set ASPNETCORE_ENVIRONMENT=Production --app greengrow-mis330

# Confirm JAWSDB_URL is already set by the addon:
heroku config --app greengrow-mis330 | grep JAWSDB
```

## Step 6 — set buildpacks (if deploying via git, not app.json)

```bash
heroku buildpacks:set heroku/nodejs --app greengrow-mis330
heroku buildpacks:add https://github.com/jincod/dotnetcore-buildpack --app greengrow-mis330
```

`app.json` already lists these; this is the manual equivalent.

## Step 7 — deploy and watch the log

```bash
git push heroku main
heroku logs --tail --app greengrow-mis330
```

Expected sequence in the build log:

1. `heroku/nodejs` installs Node, runs root `npm install`, then
   `heroku-postbuild` — this runs `npm ci && npm run build` in `frontend/`
   and copies the Vite bundle into `backend/wwwroot/`.
2. `dotnetcore-buildpack` runs `dotnet restore` and
   `dotnet publish backend/GreenGrow.Api.csproj -c Release -o heroku_output`.
   It picks up the static files automatically because they live inside the
   project's `wwwroot/`.
3. Release phase → dyno boots → `Program.cs` applies any pending EF
   migrations and calls `DbSeeder.Seed(db)` (no-op if ProductCategory
   already has rows).

## Step 8 — smoke test

```bash
heroku open --app greengrow-mis330
```

Check these paths on the live site:

- `/` — the React home page loads.
- `/api/dashboard/stats` — returns JSON with non-zero counts.
- `/swagger` — Swagger UI loads.
- Log in as `jordan.smith@example.com` / `password1`.
- Add a product to the cart, checkout, confirm the order appears.
- Refresh the dashboard — KPIs should reflect your new order.

## Things that will NOT work

- The three SQL files in `/database/` (`database_creation_queries.sql`,
  `data_loading_queries.sql`, `data_analysis_queries.sql`) are graded
  deliverables. They do **not** run automatically on Heroku — EF Core
  migrations + `DbSeeder.cs` own the live schema and seed data. The SQL
  files are the class deliverable; the running app is an independent demo.

## If the build fails

| Symptom | Fix |
|---------|-----|
| `Cannot find module '@rollup/rollup-linux-x64-gnu'` | This is a sandbox-only issue. It won't happen on Heroku because `npm ci` installs fresh Linux-native binaries. |
| `The SDK 'Microsoft.NET.Sdk.Web' specified could not be found` | The buildpack didn't pick the backend project. Double-check `PROJECT_FILE=backend/GreenGrow.Api.csproj` in `heroku config`. |
| `error TS2339: Property 'env' does not exist on type 'ImportMeta'` | `frontend/src/vite-env.d.ts` is missing from the commit. |
| Site loads but every page shows a blank screen | The SPA fallback isn't working. Confirm `app.MapFallbackToFile("index.html")` is in `backend/Program.cs` and came AFTER `app.MapControllers()`. |
| Dashboard says 0 for everything | The seeder ran against an already-populated DB and bailed. This is fine; add a product via the admin panel to see live updates. |
