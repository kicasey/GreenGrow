using System.Data.Common;
using GreenGrow.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

public record ReportDefinition(
    string Id,
    string Title,
    string Description,
    string Category,
    string Sql);

public record ReportResult(
    string Id,
    string Title,
    string Description,
    string Category,
    string Sql,
    IReadOnlyList<string> Columns,
    IReadOnlyList<IReadOnlyList<object?>> Rows,
    int RowCount,
    string? Error);

/// <summary>
/// Runs the MIS 330 stage-2 data analysis queries verbatim against the live
/// MySQL database and returns the full result set for each so the admin
/// reports page can render them as tables.
///
/// Queries are defined as string literals (not user input) and executed
/// via the shared EF Core DbConnection — we don't mutate schema or data.
/// </summary>
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public ReportsController(GreenGrowContext db) => _db = db;

    private static readonly ReportDefinition[] Reports = new[]
    {
        new ReportDefinition(
            "q1-full-product-list",
            "Full product list with category",
            "Every product joined with its category, sorted for easy browsing.",
            "Inventory",
            @"select p.ProductID, p.ProductName, c.CategoryName, p.ProductCost, p.Quantity as stockonhand
from Product p join ProductCategory c on p.CategoryID=c.CategoryID
order by c.CategoryName, p.ProductName;"),

        new ReportDefinition(
            "q2-top-5-sellers",
            "Top 5 best-selling products",
            "Products ranked by total units sold across all orders.",
            "Sales",
            @"select p.ProductID, p.ProductName, sum(oc.Quantity) as totalunitssold,
    sum(oc.LineTotal) as revenue
from OrderContains oc join Product p on oc.ProductID=p.ProductID
group by p.ProductID, p.ProductName
order by totalunitssold desc
limit 5;"),

        new ReportDefinition(
            "q3-revenue-by-category",
            "Revenue by product category",
            "Units sold and revenue grouped by category, highest-grossing first.",
            "Sales",
            @"select c.CategoryName, count(distinct p.ProductID) as distinctproductssold,
    sum(oc.Quantity) as unitssold, sum(oc.LineTotal) as categoryrevenue
from ProductCategory c join Product p on p.CategoryID=c.CategoryID
    join OrderContains oc on oc.ProductID=p.ProductID
group by c.CategoryID, c.CategoryName
order by categoryrevenue desc;"),

        new ReportDefinition(
            "q4-top-customers",
            "Top customers (spent over $50)",
            "Customers filtered with HAVING so only higher-value shoppers appear.",
            "Customers",
            @"select u.UserID, concat(u.Fname, ' ', u.Lname) as customername,
    min(ue.UserEmail) as email, count(o.OrderID) as ordercount,
    sum(o.OrderTotal) as totalspent
from `User` u join UserEmail ue on ue.UserID=u.UserID
    join `Order` o on o.UserID=u.UserID
group by u.UserID, u.Fname, u.Lname
having sum(o.OrderTotal) > 50
order by totalspent desc;"),

        new ReportDefinition(
            "q5-store-overview",
            "Store overview (subqueries)",
            "One-row overview of totals built entirely from subqueries.",
            "Overview",
            @"select
    (select count(*) from `Order`) as totalorders,
    (select sum(OrderTotal) from `Order`) as totalrevenue,
    (select avg(OrderTotal) from `Order`) as avgordervalue,
    (select count(*) from `User`) as totalcustomers,
    (select sum(Quantity) from Product) as totalunitsinstock;"),

        new ReportDefinition(
            "q6-low-stock",
            "Low stock products (qty < 10)",
            "Inventory items approaching stockout, sorted by remaining quantity.",
            "Inventory",
            @"select p.ProductID, p.ProductName, c.CategoryName, p.Quantity as unitsonhand
from Product p join ProductCategory c on c.CategoryID=p.CategoryID
where p.Quantity < 10
order by p.Quantity asc;"),

        new ReportDefinition(
            "q7-never-ordered",
            "Products that have never been ordered",
            "LEFT JOIN + IS NULL to surface dead-stock candidates.",
            "Inventory",
            @"select p.ProductID, p.ProductName, p.Quantity as unitsonhand
from Product p left join OrderContains oc on oc.ProductID=p.ProductID
where oc.ProductID is null
order by p.ProductName;"),

        new ReportDefinition(
            "q8-employee-tracking",
            "Employee product tracking summary",
            "How many products each employee is tracking via EmployeeTracks.",
            "Operations",
            @"select e.EmployeeID, concat(e.Fname, ' ', e.Lname) as empname,
    e.JobPosition, count(et.ProductID) as productstracked
from Employee e left join EmployeeTracks et on et.EmployeeID=e.EmployeeID
group by e.EmployeeID, e.Fname, e.Lname, e.JobPosition
order by productstracked desc;"),

        new ReportDefinition(
            "q9-multi-email-customers",
            "Customers with more than one email",
            "Uses the UserEmail multi-valued table to find customers with several emails on file.",
            "Customers",
            @"select u.UserID, concat(u.Fname, ' ', u.Lname) as customername,
    count(ue.UserEmail) as emailcount
from `User` u join UserEmail ue on ue.UserID=u.UserID
group by u.UserID, u.Fname, u.Lname
having count(ue.UserEmail) > 1;"),

        new ReportDefinition(
            "q10-monthly-sales",
            "Monthly sales (date functions)",
            "Orders and revenue bucketed by month using DATE_FORMAT.",
            "Sales",
            @"select date_format(OrderDate, '%Y-%m') as ordermonth,
    count(*) as totalorders, sum(OrderTotal) as monthlyrevenue
from `Order`
group by date_format(OrderDate, '%Y-%m')
order by ordermonth;"),

        new ReportDefinition(
            "q11-avg-order-metrics",
            "Average order value and items per order",
            "Aggregate KPIs for the whole order history.",
            "Overview",
            @"select count(distinct o.OrderID) as totalorders,
    round(avg(o.OrderTotal), 2) as avgordervalue,
    round(sum(oc.Quantity) / count(distinct o.OrderID), 2) as avgitemsperorder
from `Order` o join OrderContains oc on o.OrderID=oc.OrderID;"),

        new ReportDefinition(
            "q12-customer-segments",
            "One-time vs repeat vs loyal buyers",
            "CTE + UNION segmentation of customers by number of orders placed.",
            "Customers",
            @"with customer_orders as
(
    select u.UserID, count(o.OrderID) as ordercount
    from `User` u left join `Order` o on u.UserID=o.UserID
    group by u.UserID
)
select 'One-Time Buyer' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount = 1
    union
select 'Repeat Buyer' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount = 2
    union
select 'Loyal Customer (3+)' as customersegment, count(*) as numcustomers
from customer_orders
where ordercount >= 3
order by numcustomers desc;"),
    };

    [HttpGet("")]
    public async Task<IEnumerable<ReportResult>> All()
    {
        var conn = _db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync();

        var results = new List<ReportResult>(Reports.Length);
        foreach (var def in Reports)
        {
            results.Add(await RunAsync(conn, def));
        }
        return results;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ReportResult>> One(string id)
    {
        var def = Reports.FirstOrDefault(r => r.Id == id);
        if (def is null) return NotFound();

        var conn = _db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync();

        return await RunAsync(conn, def);
    }

    private static async Task<ReportResult> RunAsync(DbConnection conn, ReportDefinition def)
    {
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = def.Sql;
            cmd.CommandType = System.Data.CommandType.Text;

            using var reader = await cmd.ExecuteReaderAsync();

            var columns = new List<string>(reader.FieldCount);
            for (int i = 0; i < reader.FieldCount; i++)
                columns.Add(reader.GetName(i));

            var rows = new List<IReadOnlyList<object?>>();
            while (await reader.ReadAsync())
            {
                var row = new object?[reader.FieldCount];
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    var value = reader.IsDBNull(i) ? null : reader.GetValue(i);
                    // Normalize DateTime to ISO strings so React can render consistently.
                    if (value is DateTime dt)
                        value = dt.ToString("yyyy-MM-ddTHH:mm:ss");
                    row[i] = value;
                }
                rows.Add(row);
            }

            return new ReportResult(
                def.Id, def.Title, def.Description, def.Category, def.Sql,
                columns, rows, rows.Count, null);
        }
        catch (Exception ex)
        {
            return new ReportResult(
                def.Id, def.Title, def.Description, def.Category, def.Sql,
                Array.Empty<string>(), Array.Empty<IReadOnlyList<object?>>(),
                0, ex.Message);
        }
    }
}
