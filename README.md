# GreenGrow

MIS 330 Group Project — Spring 2026.

Full-stack demo that exercises the database designed in Stage 1:

- **Backend:** ASP.NET Core 8 Web API with EF Core (Pomelo MySQL provider)
- **Frontend:** React 18 + TypeScript + Vite
- **Database:** MySQL 8 (+ EF Core migrations)
- **Auth:** BCrypt-hashed passwords stored in the `User` / `Employee` tables
- **Deploy target:** Heroku

## Stage 1 feedback addressed

1. `Employee.Password` column added (see `database/schema.sql` and `backend/Models/Employee.cs`). Passwords are hashed with BCrypt before they're stored.
2. `Quantity` attribute added to the CONTAINS relationship (see the `OrderContains` table and model; column `Quantity` plus a convenience `LineTotal`).

## Repo layout

```
GreenGrow/
├── README.md
├── database/
│   └── schema.sql              # Hand-written MySQL schema + seed (reference copy)
├── backend/                    # ASP.NET Core 8 Web API
│   ├── GreenGrow.Api.csproj
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── Procfile                # Heroku web process
│   ├── Properties/launchSettings.json
│   ├── Data/
│   │   ├── GreenGrowContext.cs
│   │   └── DesignTimeDbContextFactory.cs  # Lets `dotnet ef` discover the context
│   ├── Models/                 # EF entities
│   ├── Dtos/Dtos.cs
│   ├── Services/PasswordService.cs        # BCrypt wrapper
│   └── Controllers/            # Auth / Categories / Products / Users / Employees / Orders / Dashboard
└── frontend/                   # React + TypeScript + Vite
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── styles.css
        ├── types.ts
        ├── api/client.ts
        ├── state/
        │   ├── AuthContext.tsx
        │   └── CartContext.tsx
        └── pages/
            ├── HomePage.tsx
            ├── LoginPage.tsx
            ├── DashboardPage.tsx
            ├── ProductsPage.tsx
            ├── ProductDetailPage.tsx
            ├── CartPage.tsx
            ├── OrdersPage.tsx
            ├── AdminPage.tsx
            └── admin/
                ├── ProductsAdmin.tsx
                ├── CategoriesAdmin.tsx
                ├── UsersAdmin.tsx
                ├── EmployeesAdmin.tsx
                └── OrdersAdmin.tsx
```

## Prerequisites

Install once on your dev machine:

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org)
- MySQL 8 (local server or MySQL Workbench connecting to a remote one)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

You also need the EF Core CLI:

```bash
dotnet tool install --global dotnet-ef
```

## 1. Create the database

Pick one of these. **Migrations are the primary path**; `schema.sql` is kept as a reference / lecture artifact.

### Option A — EF Core migrations (recommended)

```bash
cd backend
# Edit appsettings.Development.json and set your MySQL password first.
dotnet ef migrations add Init
dotnet ef database update
```

`dotnet ef migrations add Init` generates `backend/Migrations/*.cs` files from the current model. `dotnet ef database update` applies them to the `greengrow` database named in your connection string. `Program.cs` will also `Migrate()` automatically on startup once migrations exist, so Heroku dynos stay in sync.

### Option B — schema.sql

```bash
mysql -u root -p < database/schema.sql
```

This drops `greengrow` if it exists, recreates all tables, and loads seed data (including BCrypt-hashed sample passwords listed below).

### Sample credentials

| Role     | Login                                 | Password   |
| -------- | ------------------------------------- | ---------- |
| Customer | `jordan.smith@example.com`            | password1  |
| Customer | `linh.nguyen@example.com`             | password2  |
| Customer | `miguel.garcia@example.com`           | password3  |
| Employee | ID `1` (Priya Patel, Inv. Manager)    | admin1     |
| Employee | ID `2` (Marcus Johnson, Floor Assoc.) | admin2     |

These are only in the seed SQL. Any user/employee you create through the API has its password hashed on the fly.

## 2. Run the backend

```bash
cd backend
dotnet restore
dotnet run
```

- API: <http://localhost:5080>
- Swagger UI: <http://localhost:5080/swagger>

## 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

- Frontend: <http://localhost:5173>
- Vite proxies every `/api/*` request to `http://localhost:5080`, so no CORS setup needed during dev.

## 4. What to demo

This app is built around walking the grader through "make a change in the UI → watch it land in the DB." Here's a suggested flow:

1. **Log in** as `jordan.smith@example.com` / `password1`. (Proves `User.Password` in the DB is matched via BCrypt.)
2. **Browse products**, filter by category, add a few to the cart.
3. **Checkout** from the cart. You'll get a new `Order` row plus N `OrderContains` rows — each with the **Quantity** column the teacher asked for.
4. **Visit Dashboard**. Click *Refresh*. The KPIs (product count, revenue, top sellers, low-stock alerts, employee tracking, recent orders) update because they're computed from live JOINs / GROUP BYs on the new data.
5. **Admin → Products**: add a new product, edit one, delete one. Hit Dashboard → Refresh to see it ripple through.
6. **Admin → Employees**: create a new employee (must supply a password). Open MySQL Workbench and show that `Employee.Password` is a BCrypt hash, not plaintext.
7. **Admin → Orders**: delete an order; note that `OrderContains` rows cascade.

## 5. API endpoints

| Resource   | GET list                | GET one                  | POST                  | PUT                   | DELETE                |
| ---------- | ----------------------- | ------------------------ | --------------------- | --------------------- | --------------------- |
| Auth       | —                       | —                        | `POST /api/auth/login/user`, `POST /api/auth/login/employee` | — | — |
| Categories | `GET /api/categories`   | `GET /api/categories/:id`| `POST /api/categories`| `PUT /api/categories/:id`| `DELETE /api/categories/:id` |
| Products   | `GET /api/products`     | `GET /api/products/:id`  | `POST /api/products`  | `PUT /api/products/:id`  | `DELETE /api/products/:id`   |
| Users      | `GET /api/users`        | `GET /api/users/:id`     | `POST /api/users`     | `PUT /api/users/:id`     | `DELETE /api/users/:id`      |
| Employees  | `GET /api/employees`    | `GET /api/employees/:id` | `POST /api/employees` | `PUT /api/employees/:id` | `DELETE /api/employees/:id`  |
| Orders     | `GET /api/orders`       | `GET /api/orders/:id`    | `POST /api/orders`    | —                       | `DELETE /api/orders/:id`     |
| Dashboard  | `GET /api/dashboard/stats` — aggregated JOIN queries across every table |

`POST /api/orders` expects a body like:

```json
{
  "userID": 1,
  "lines": [
    { "productID": 1, "quantity": 2 },
    { "productID": 3, "quantity": 1 }
  ]
}
```

## 6. Deploy to Heroku

```bash
cd backend
heroku create greengrow-mis330
heroku addons:create jawsdb:kitefin
heroku buildpacks:set jincod/dotnetcore
git push heroku main
heroku open
```

`Program.cs` reads `JAWSDB_URL` / `CLEARDB_DATABASE_URL` / `DATABASE_URL` in that order, translates the URI to an ADO.NET connection string, and runs pending migrations at startup. No manual SQL steps required once you've committed at least one EF migration.

### Frontend hosting

Easiest: deploy `frontend/` separately on Vercel / Netlify and set `VITE_API_BASE` to your Heroku app URL. Then add that origin to the CORS list in `Program.cs` before pushing again.

## 7. What to work on next

- Replace the in-memory React auth context with a JWT returned from `/api/auth/login` and stored somewhere browser-friendly.
- Employee-specific views (restock tool that hits `PUT /api/products/:id`).
- Charts on the Dashboard using Recharts.
- Unit tests for the order-total math and password hashing.

## Tech stack notes

- Pomelo.EntityFrameworkCore.MySql is used because it has more production mileage than Oracle's `MySql.EntityFrameworkCore` on .NET 8.
- BCrypt hash format (`$2b$10$...`) is stored as-is in `User.Password` and `Employee.Password` — both VARCHAR(255).
- `OrderContains` is a true association entity: it has its own `Quantity` and `LineTotal` attributes beyond the two FKs.
- CORS is preconfigured for `http://localhost:5173` and `http://localhost:3000`.
