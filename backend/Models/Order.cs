using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenGrow.Api.Models;

[Table("Order")]
public class Order
{
    [Key]
    public int OrderID { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    [Column(TypeName = "decimal(10,2)")]
    public decimal OrderTotal { get; set; }

    [Required, MaxLength(40)]
    public string OrderConfirmation { get; set; } = string.Empty;

    public int UserID { get; set; }
    public User? User { get; set; }

    // Junction: the products this order CONTAINS
    public ICollection<OrderContains> Lines { get; set; } = new List<OrderContains>();
}

/// <summary>
/// Junction for the CONTAINS relationship between Order and Product.
/// Quantity attribute added per Stage 1 feedback.
/// </summary>
[Table("OrderContains")]
public class OrderContains
{
    public int OrderID { get; set; }
    public Order? Order { get; set; }

    public int ProductID { get; set; }
    public Product? Product { get; set; }

    /// <summary>Quantity of this product in the order (teacher feedback).</summary>
    public int Quantity { get; set; } = 1;

    [Column(TypeName = "decimal(10,2)")]
    public decimal LineTotal { get; set; }
}

/// <summary>Junction for the TRACKS relationship between Employee and Product.</summary>
[Table("EmployeeTracks")]
public class EmployeeTracks
{
    public int EmployeeID { get; set; }
    public Employee? Employee { get; set; }

    public int ProductID { get; set; }
    public Product? Product { get; set; }
}
