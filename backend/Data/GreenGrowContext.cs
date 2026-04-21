using GreenGrow.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Data;

public class GreenGrowContext : DbContext
{
    public GreenGrowContext(DbContextOptions<GreenGrowContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<UserEmail> UserEmails => Set<UserEmail>();
    public DbSet<UserPhone> UserPhones => Set<UserPhone>();

    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<EmployeePhone> EmployeePhones => Set<EmployeePhone>();

    public DbSet<ProductCategory> ProductCategories => Set<ProductCategory>();
    public DbSet<Product> Products => Set<Product>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderContains> OrderContains => Set<OrderContains>();
    public DbSet<EmployeeTracks> EmployeeTracks => Set<EmployeeTracks>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // ---- Multi-valued attribute tables (composite PK) ----
        mb.Entity<UserEmail>(e =>
        {
            e.ToTable("UserEmail");
            e.HasKey(x => new { x.Email, x.UserID });
            e.Property(x => x.Email).HasColumnName("UserEmail").HasMaxLength(120);
            e.HasOne(x => x.User).WithMany(u => u.Emails).HasForeignKey(x => x.UserID);
        });

        mb.Entity<UserPhone>(e =>
        {
            e.ToTable("UserPhone");
            e.HasKey(x => new { x.PhoneNumber, x.UserID });
            e.Property(x => x.PhoneNumber).HasColumnName("UserPhoneNum").HasMaxLength(20);
            e.HasOne(x => x.User).WithMany(u => u.Phones).HasForeignKey(x => x.UserID);
        });

        mb.Entity<EmployeePhone>(e =>
        {
            e.ToTable("EmployeePhone");
            e.HasKey(x => new { x.PhoneNumber, x.EmployeeID });
            e.Property(x => x.PhoneNumber).HasColumnName("EmployeePhone").HasMaxLength(20);
            e.HasOne(x => x.Employee).WithMany(emp => emp.Phones).HasForeignKey(x => x.EmployeeID);
        });

        // ---- Contains (Order <-> Product) composite PK ----
        mb.Entity<OrderContains>(e =>
        {
            e.HasKey(x => new { x.OrderID, x.ProductID });
            e.HasOne(x => x.Order).WithMany(o => o.Lines).HasForeignKey(x => x.OrderID);
            e.HasOne(x => x.Product).WithMany(p => p.OrderLines).HasForeignKey(x => x.ProductID);
        });

        // ---- Tracks (Employee <-> Product) composite PK ----
        mb.Entity<EmployeeTracks>(e =>
        {
            e.HasKey(x => new { x.EmployeeID, x.ProductID });
            e.HasOne(x => x.Employee).WithMany(emp => emp.Tracks).HasForeignKey(x => x.EmployeeID);
            e.HasOne(x => x.Product).WithMany(p => p.Trackers).HasForeignKey(x => x.ProductID);
        });

        // ---- Order FK to User ----
        mb.Entity<Order>()
            .HasOne(o => o.User)
            .WithMany(u => u.Orders)
            .HasForeignKey(o => o.UserID);

        // ---- Product FK to Category ----
        mb.Entity<Product>()
            .HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryID);
    }
}
