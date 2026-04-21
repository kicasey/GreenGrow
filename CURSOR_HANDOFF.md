# Cursor handoff prompt

Paste everything below this line into Cursor chat (or Cursor's "Composer" agent).

---

I'm continuing work on a full-stack class project called **GreenGrow** (MIS 330 Spring 2026 group project). The scaffold is already in place — I just need you to help me finish getting it running and walk me through generating + applying EF Core migrations.

## Project layout (already exists in this repo)

```
GreenGrow/
├── README.md                     ← Read this first. It has run + demo instructions.
├── database/schema.sql           ← Reference MySQL schema + seed data (NOT used for setup)
├── backend/                      ← ASP.NET Core 8 Web API + EF Core + Pomelo MySQL
│   ├── GreenGrow.Api.csproj
│   ├── Program.cs                ← Auto-runs Migrate() + DbSeeder.Seed() on startup
│   ├── appsettings.Development.json  ← EDIT: set your MySQL password here
│   ├── Procfile, app.json        ← Heroku config
│   ├── Data/GreenGrowContext.cs, DesignTimeDbContextFactory.cs, DbSeeder.cs
│   ├── Models/                   ← User, Employee, Product, ProductCategory, Order, OrderContains (w/ Quantity), EmployeeTracks, UserEmail, UserPhone, EmployeePhone
│   ├── Services/PasswordService.cs   ← BCrypt wrapper
│   ├── Dtos/Dtos.cs
│   └── Controllers/              ← Auth, Categories, Products, Users, Employees, Orders, Dashboard
└── frontend/                     ← React 18 + TS + Vite
    ├── package.json, vite.config.ts, tsconfig.json, index.html
    └── src/
        ├── main.tsx, App.tsx, types.ts, styles.css
        ├── api/client.ts
        ├── state/AuthContext.tsx, CartContext.tsx
        └── pages/
            ├── HomePage, LoginPage, DashboardPage, ProductsPage,
            │   ProductDetailPage, CartPage, OrdersPage, AdminPage
            └── admin/ProductsAdmin, CategoriesAdmin, UsersAdmin,
                       EmployeesAdmin, OrdersAdmin
```

## Where I'm at right now

- MySQL is installed locally.
- I have created an **empty `greengrow` database** (`CREATE DATABASE greengrow;` — that's it).
- I did **NOT** load `database/schema.sql`. The DB has no tables.
- I want EF Core migrations to create the schema.
- `appsettings.Development.json` still has `Password=CHANGE_ME` — I need to put my real MySQL password there.
- I have not run the backend or installed frontend deps yet.

## Teacher feedback already addressed in the code

Don't remove either of these — they're part of the rubric:
1. `Employee.Password` column exists (VARCHAR(255), stores BCrypt hashes).
2. `OrderContains.Quantity` column exists on the junction table between Order and Product.

## What I need you to do, in order

1. **Verify my dev environment.** Run `dotnet --version` and `node --version`. If `dotnet-ef` isn't installed, install it: `dotnet tool install --global dotnet-ef`.

2. **Set the MySQL connection string** in `backend/appsettings.Development.json`. Ask me for my MySQL root password and update the file. The connection string already points at `Database=greengrow` on `localhost:3306`.

3. **Generate the initial EF Core migration:**
   ```
   cd backend
   dotnet ef migrations add Init
   ```
   This creates a `Migrations/` folder. We'll commit it so Heroku can apply it later.

4. **Apply the migration to my empty `greengrow` database:**
   ```
   dotnet ef database update
   ```
   This creates every table from the EF model. Important: I already have an empty `greengrow` database — do NOT drop it or recreate it. Just apply the migration against the existing empty DB.

5. **Start the backend:**
   ```
   dotnet run
   ```
   On startup, `Program.cs` will call `DbSeeder.Seed()` which populates the tables with demo data (6 products, 3 users, 2 employees with BCrypt-hashed passwords, 2 sample orders exercising the `OrderContains.Quantity` column, and the EmployeeTracks relationship rows). This is a no-op on subsequent starts.

   Confirm:
   - Swagger loads at `http://localhost:5080/swagger`
   - `GET /api/dashboard/stats` returns non-zero counts
   - In MySQL Workbench, `SELECT * FROM Employee;` shows BCrypt hashes in the `Password` column (should start with `$2a$10$...`)
   - `SELECT * FROM OrderContains;` shows `Quantity` column populated

   Fix any errors that come up.

6. **Install frontend deps and start the dev server:**
   ```
   cd ../frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:5173`, log in as `jordan.smith@example.com` / `password1`, and walk through:
   - Products page → add a couple of items to cart
   - Cart page → checkout (this hits `POST /api/orders`)
   - Orders page → confirm the new order appears
   - Dashboard → Refresh → confirm KPIs updated
   - Admin → Products → add/edit/delete a product, confirm it reflects in Workbench

   Fix anything that throws.

7. **After it all runs**, look at the code and tell me about any smells or demo-weaknesses you see — but don't rewrite anything without asking me first.

## Stack + important gotchas

- MySQL provider is **Pomelo.EntityFrameworkCore.MySql** (NOT Oracle's MySql.EntityFrameworkCore).
- `Program.cs` reads Heroku env vars (`JAWSDB_URL`, `CLEARDB_DATABASE_URL`, `DATABASE_URL`) and falls back to `appsettings.Development.json`. It also auto-runs `Database.Migrate()` + `DbSeeder.Seed()` on startup.
- Passwords are BCrypt-hashed via `Services/PasswordService.cs`. Login endpoints are `POST /api/auth/login/user` and `POST /api/auth/login/employee`. Seed credentials:
  - `jordan.smith@example.com` / `password1`
  - `linh.nguyen@example.com` / `password2`
  - `miguel.garcia@example.com` / `password3`
  - Employee ID `1` / `admin1`
  - Employee ID `2` / `admin2`
- Vite proxies `/api/*` from `:5173` to `:5080` (see `frontend/vite.config.ts`), so there's no CORS setup needed locally.
- The Admin page has five tabs with full CRUD forms. The Dashboard page (`/dashboard`) is the demo centerpiece — `GET /api/dashboard/stats` runs JOINs/GROUP BYs across every table.
- `database/schema.sql` is kept as a reference / lecture artifact. We're not using it for setup — EF migrations are the source of truth.
- We're eventually deploying backend to Heroku with a JawsDB MySQL add-on. The frontend will deploy separately. Not urgent.

## My preferences

- **Don't rip things out.** If you think something is wrong, flag it and let me decide.
- **Keep it readable.** Prose/comments over heavy abstractions — this is a class project.
- **Use small iterative diffs** rather than rewriting whole files.
- **Ask me before anything destructive** (dropping DB, deleting files, rewriting schema).

Start by reading `README.md`, then step 1 above.
