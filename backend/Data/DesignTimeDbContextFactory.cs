using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace GreenGrow.Api.Data;

/// <summary>
/// Lets `dotnet ef migrations add ...` and `dotnet ef database update`
/// find a DbContext without spinning up the full web host.
/// Reads ConnectionStrings:GreenGrow from appsettings.Development.json.
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<GreenGrowContext>
{
    public GreenGrowContext CreateDbContext(string[] args)
    {
        var config = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        string? cs = config.GetConnectionString("GreenGrow")
            ?? Environment.GetEnvironmentVariable("JAWSDB_URL")
            ?? throw new InvalidOperationException(
                "Set ConnectionStrings:GreenGrow in appsettings.Development.json before running `dotnet ef`.");

        var options = new DbContextOptionsBuilder<GreenGrowContext>()
            .UseMySql(cs, ServerVersion.AutoDetect(cs))
            .Options;

        return new GreenGrowContext(options);
    }
}
