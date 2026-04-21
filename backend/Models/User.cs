using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenGrow.Api.Models;

[Table("User")]
public class User
{
    [Key]
    public int UserID { get; set; }

    [Required, MaxLength(60)]
    public string Lname { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Fname { get; set; } = string.Empty;

    /// <summary>Hashed password. Never return this from the API.</summary>
    [Required, MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Multi-valued attributes from ERD
    public ICollection<UserEmail> Emails { get; set; } = new List<UserEmail>();
    public ICollection<UserPhone> Phones { get; set; } = new List<UserPhone>();

    // 1-to-many: a user places many orders
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

[Table("UserEmail")]
public class UserEmail
{
    [MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    public int UserID { get; set; }
    public User? User { get; set; }
}

[Table("UserPhone")]
public class UserPhone
{
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    public int UserID { get; set; }
    public User? User { get; set; }
}
