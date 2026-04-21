using GreenGrow.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

public record TopProductDto(int ProductID, string ProductName, int TotalSold, decimal Revenue);
public record LowStockDto(int ProductID, string ProductName, int Quantity, string CategoryName);
public record CategoryBreakdownDto(string CategoryName, int ProductCount, int TotalStock);
public record EmployeeTrackingDto(int EmployeeID, string Name, string JobPosition, int ProductsTracked);
public record RecentOrderDto(int OrderID, string OrderConfirmation, DateTime OrderDate, decimal Total, string Customer, int ItemCount);

public record DashboardStats(
    int TotalProducts,
    int TotalCategories,
    int TotalUsers,
    int TotalEmployees,
    int TotalOrders,
    decimal TotalRevenue,
    int TotalInventoryUnits,
    IEnumerable<TopProductDto> TopProducts,
    IEnumerable<LowStockDto> LowStock,
    IEnumerable<CategoryBreakdownDto> CategoryBreakdown,
    IEnumerable<EmployeeTrackingDto> EmployeeTracking,
    IEnumerable<RecentOrderDto> RecentOrders);

/// <summary>
/// One-shot endpoint that runs the "demo-worthy" joins against every table.
/// Hit GET /api/dashboard/stats and the UI will refresh every aggregation.
/// </summary>
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public DashboardController(GreenGrowContext db) => _db = db;

    [HttpGet("stats")]
    public async Task<DashboardStats> Stats()
    {
        int totalProducts      = await _db.Products.CountAsync();
        int totalCategories    = await _db.ProductCategories.CountAsync();
        int totalUsers         = await _db.Users.CountAsync();
        int totalEmployees     = await _db.Employees.CountAsync();
        int totalOrders        = await _db.Orders.CountAsync();
        decimal totalRevenue   = await _db.Orders.SumAsync(o => (decimal?)o.OrderTotal) ?? 0m;
        int totalInventoryUnits = await _db.Products.SumAsync(p => (int?)p.Quantity) ?? 0;

        // JOIN OrderContains + Product — top sellers by total quantity.
        var topProductsRaw = await _db.OrderContains
            .GroupBy(oc => new { oc.ProductID, oc.Product!.ProductName })
            .Select(g => new
            {
                g.Key.ProductID,
                g.Key.ProductName,
                TotalSold = g.Sum(x => x.Quantity),
                Revenue = g.Sum(x => x.LineTotal)
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(5)
            .ToListAsync();
        var topProducts = topProductsRaw
            .Select(x => new TopProductDto(x.ProductID, x.ProductName, x.TotalSold, x.Revenue))
            .ToList();

        var lowStock = await _db.Products
            .Where(p => p.Quantity < 10)
            .OrderBy(p => p.Quantity)
            .Select(p => new LowStockDto(p.ProductID, p.ProductName, p.Quantity, p.Category!.CategoryName))
            .ToListAsync();

        var categoryBreakdown = await _db.ProductCategories
            .Select(c => new CategoryBreakdownDto(
                c.CategoryName,
                c.Products.Count(),
                c.Products.Sum(p => (int?)p.Quantity) ?? 0))
            .ToListAsync();

        var employeeTrackingRaw = await _db.Employees
            .Select(e => new
            {
                e.EmployeeID,
                Name = e.Fname + " " + e.Lname,
                e.JobPosition,
                ProductsTracked = e.Tracks.Count()
            })
            .OrderByDescending(e => e.ProductsTracked)
            .ToListAsync();
        var employeeTracking = employeeTrackingRaw
            .Select(e => new EmployeeTrackingDto(e.EmployeeID, e.Name, e.JobPosition, e.ProductsTracked))
            .ToList();

        var recentOrders = await _db.Orders
            .OrderByDescending(o => o.OrderDate)
            .Take(5)
            .Select(o => new RecentOrderDto(
                o.OrderID,
                o.OrderConfirmation,
                o.OrderDate,
                o.OrderTotal,
                o.User!.Fname + " " + o.User.Lname,
                o.Lines.Count()))
            .ToListAsync();

        return new DashboardStats(
            totalProducts, totalCategories, totalUsers, totalEmployees,
            totalOrders, totalRevenue, totalInventoryUnits,
            topProducts, lowStock, categoryBreakdown, employeeTracking, recentOrders);
    }
}
