using GreenGrow.Api.Models;
using GreenGrow.Api.Services;

namespace GreenGrow.Api.Data;

/// <summary>
/// Seeds the database with a demo dataset when the core tables are empty.
/// Runs on startup (see Program.cs) so that after `dotnet ef database update`
/// the app comes up with realistic data — same rows as database/schema.sql.
/// Safe to run repeatedly: it bails out if ProductCategory already has rows.
/// </summary>
public static class DbSeeder
{
    public static void Seed(GreenGrowContext db)
    {
        if (db.ProductCategories.Any()) return;  // already seeded

        // ---- Categories ----
        var indoor   = new ProductCategory { CategoryName = "Indoor Plants" };
        var outdoor  = new ProductCategory { CategoryName = "Outdoor Plants" };
        var seeds    = new ProductCategory { CategoryName = "Seeds" };
        var tools    = new ProductCategory { CategoryName = "Tools" };
        var fertSoil = new ProductCategory { CategoryName = "Fertilizer & Soil" };
        db.ProductCategories.AddRange(indoor, outdoor, seeds, tools, fertSoil);
        db.SaveChanges();

        // ---- Products ----
        var monstera = new Product { ProductName = "Monstera Deliciosa",
            ProductDescription = "Large tropical split-leaf houseplant.",
            ProductCost = 34.99m, Quantity = 25, CategoryID = indoor.CategoryID };
        var snake = new Product { ProductName = "Snake Plant",
            ProductDescription = "Low-light, low-water hardy houseplant.",
            ProductCost = 18.50m, Quantity = 40, CategoryID = indoor.CategoryID };
        var tomato = new Product { ProductName = "Tomato Seeds (Pack)",
            ProductDescription = "Heirloom tomato seed pack, approx. 50 seeds.",
            ProductCost = 3.99m, Quantity = 200, CategoryID = seeds.CategoryID };
        var trowel = new Product { ProductName = "Hand Trowel",
            ProductDescription = "Stainless steel garden hand trowel.",
            ProductCost = 12.00m, Quantity = 60, CategoryID = tools.CategoryID };
        var compost = new Product { ProductName = "Organic Compost 20lb",
            ProductDescription = "Premium organic compost, 20 pound bag.",
            ProductCost = 14.75m, Quantity = 80, CategoryID = fertSoil.CategoryID };
        var lavender = new Product { ProductName = "Lavender Plant",
            ProductDescription = "Fragrant outdoor perennial.",
            ProductCost = 9.99m, Quantity = 30, CategoryID = outdoor.CategoryID };
        db.Products.AddRange(monstera, snake, tomato, trowel, compost, lavender);
        db.SaveChanges();

        // ---- Users (real BCrypt hashes computed here so demo logins always work) ----
        var jordan = new User { Fname = "Jordan", Lname = "Smith",
            Password = PasswordService.Hash("password1") };
        var linh = new User { Fname = "Linh", Lname = "Nguyen",
            Password = PasswordService.Hash("password2") };
        var miguel = new User { Fname = "Miguel", Lname = "Garcia",
            Password = PasswordService.Hash("password3") };
        db.Users.AddRange(jordan, linh, miguel);
        db.SaveChanges();

        db.UserEmails.AddRange(
            new UserEmail { Email = "jordan.smith@example.com",  UserID = jordan.UserID },
            new UserEmail { Email = "linh.nguyen@example.com",   UserID = linh.UserID },
            new UserEmail { Email = "miguel.garcia@example.com", UserID = miguel.UserID });
        db.UserPhones.AddRange(
            new UserPhone { PhoneNumber = "205-555-0101", UserID = jordan.UserID },
            new UserPhone { PhoneNumber = "205-555-0102", UserID = linh.UserID },
            new UserPhone { PhoneNumber = "205-555-0103", UserID = miguel.UserID });

        // ---- Employees ----
        var priya = new Employee { Fname = "Priya", Lname = "Patel",
            JobPosition = "Inventory Manager",
            Password = PasswordService.Hash("admin1") };
        var marcus = new Employee { Fname = "Marcus", Lname = "Johnson",
            JobPosition = "Floor Associate",
            Password = PasswordService.Hash("admin2") };
        db.Employees.AddRange(priya, marcus);
        db.SaveChanges();

        db.EmployeePhones.AddRange(
            new EmployeePhone { PhoneNumber = "205-555-0201", EmployeeID = priya.EmployeeID },
            new EmployeePhone { PhoneNumber = "205-555-0202", EmployeeID = marcus.EmployeeID });

        // ---- Tracks relationship ----
        db.EmployeeTracks.AddRange(
            new EmployeeTracks { EmployeeID = priya.EmployeeID,  ProductID = monstera.ProductID },
            new EmployeeTracks { EmployeeID = priya.EmployeeID,  ProductID = snake.ProductID },
            new EmployeeTracks { EmployeeID = priya.EmployeeID,  ProductID = compost.ProductID },
            new EmployeeTracks { EmployeeID = marcus.EmployeeID, ProductID = tomato.ProductID },
            new EmployeeTracks { EmployeeID = marcus.EmployeeID, ProductID = trowel.ProductID },
            new EmployeeTracks { EmployeeID = marcus.EmployeeID, ProductID = lavender.ProductID });

        // ---- Sample orders (exercise OrderContains.Quantity + LineTotal) ----
        var order1 = new Order {
            UserID = jordan.UserID,
            OrderConfirmation = "GG-2026-0001",
            OrderTotal = 53.49m,
            Lines = new List<OrderContains> {
                new() { ProductID = monstera.ProductID, Quantity = 1, LineTotal = 34.99m },
                new() { ProductID = trowel.ProductID,   Quantity = 1, LineTotal = 12.00m },
                new() { ProductID = tomato.ProductID,   Quantity = 1, LineTotal =  3.99m },
                new() { ProductID = compost.ProductID,  Quantity = 1, LineTotal =  2.51m },
            }
        };
        var order2 = new Order {
            UserID = linh.UserID,
            OrderConfirmation = "GG-2026-0002",
            OrderTotal = 9.99m,
            Lines = new List<OrderContains> {
                new() { ProductID = lavender.ProductID, Quantity = 1, LineTotal = 9.99m },
            }
        };
        db.Orders.AddRange(order1, order2);

        db.SaveChanges();
    }
}
