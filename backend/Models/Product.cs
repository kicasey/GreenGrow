using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenGrow.Api.Models;

[Table("ProductCategory")]
public class ProductCategory
{
    [Key]
    public int CategoryID { get; set; }

    [Required, MaxLength(80)]
    public string CategoryName { get; set; } = string.Empty;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

[Table("Product")]
public class Product
{
    [Key]
    public int ProductID { get; set; }

    [Required, MaxLength(120)]
    public string ProductName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? ProductDescription { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal ProductCost { get; set; }

    public int Quantity { get; set; }

    public int CategoryID { get; set; }
    public ProductCategory? Category { get; set; }

    // Many-to-many: products APPEAR IN orders (Contains)
    public ICollection<OrderContains> OrderLines { get; set; } = new List<OrderContains>();

    // Many-to-many: products TRACKED BY employees
    public ICollection<EmployeeTracks> Trackers { get; set; } = new List<EmployeeTracks>();
}
