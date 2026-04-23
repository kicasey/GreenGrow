using GreenGrow.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ----------------------------------------------------------------------------
// Database: MySQL via Pomelo EF Core provider.
// Locally: connection string in appsettings.Development.json
// On Heroku: read from DATABASE_URL or JAWSDB_URL / CLEARDB_DATABASE_URL env var
// ----------------------------------------------------------------------------
string? connectionString =
    Environment.GetEnvironmentVariable("JAWSDB_URL")
    ?? Environment.GetEnvironmentVariable("CLEARDB_DATABASE_URL")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? builder.Configuration.GetConnectionString("GreenGrow");

if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "No MySQL connection string configured. Set ConnectionStrings:GreenGrow in appsettings or JAWSDB_URL env var.");
}

// Heroku MySQL add-ons (JawsDB, ClearDB) hand you a URI style string like
// mysql://user:pass@host:port/dbname — translate to ADO.NET style.
if (connectionString.StartsWith("mysql://", StringComparison.OrdinalIgnoreCase))
{
    connectionString = ConvertMysqlUriToAdo(connectionString);
}

builder.Services.AddDbContext<GreenGrowContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// ----------------------------------------------------------------------------
// MVC / Swagger / CORS
// ----------------------------------------------------------------------------
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

const string DevCors = "DevCors";
builder.Services.AddCors(opt =>
{
    opt.AddPolicy(DevCors, policy =>
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Auto-apply any pending EF Core migrations on startup so Heroku dynos pick up
// schema changes without someone shelling in to run `dotnet ef database update`.
// Then seed the demo dataset (no-op if ProductCategory already has rows).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<GreenGrowContext>();
    if (db.Database.GetMigrations().Any())
    {
        db.Database.Migrate();
    }
    DbSeeder.Seed(db);
}

// Swagger in all envs so Heroku reviewers / graders can poke the API.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(DevCors);

// Serve the built React app out of wwwroot. The Heroku nodejs buildpack runs
// `npm run build` in /frontend during deploy, and our heroku-postbuild script
// copies frontend/dist/* into backend/wwwroot/ before the dotnet publish.
// Locally, wwwroot is empty — that's fine, the Vite dev server handles the UI.
app.UseDefaultFiles();   // Rewrites "/" -> "/index.html"
app.UseStaticFiles();    // Serves assets (js, css, images)

app.MapControllers();

// SPA fallback: any non-API, non-file request returns index.html so React
// Router can take over (e.g., hitting /dashboard directly on a cold tab).
app.MapFallbackToFile("index.html");

// Heroku routes traffic to $PORT. Locally, let launchSettings / ASPNETCORE_URLS decide.
string? port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    app.Urls.Add($"http://0.0.0.0:{port}");
}

app.Run();


// ----------------------------------------------------------------------------
// Helper: translate mysql://user:pass@host:port/db → ADO.NET connection string
// ----------------------------------------------------------------------------
static string ConvertMysqlUriToAdo(string uri)
{
    var u = new Uri(uri);
    var userInfo = u.UserInfo.Split(':', 2);
    string user = Uri.UnescapeDataString(userInfo[0]);
    string pass = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
    string db = u.AbsolutePath.TrimStart('/');
    int port = u.Port > 0 ? u.Port : 3306;
    return $"Server={u.Host};Port={port};Database={db};User Id={user};Password={pass};SslMode=Preferred;";
}
