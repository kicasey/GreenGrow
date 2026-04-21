using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GreenGrow.Api.Models;

[Table("Employee")]
public class Employee
{
    [Key]
    public int EmployeeID { get; set; }

    [Required, MaxLength(60)]
    public string Lname { get; set; } = string.Empty;

    [Required, MaxLength(60)]
    public string Fname { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string JobPosition { get; set; } = string.Empty;

    /// <summary>
    /// Hashed password. Added in response to Stage 1 feedback.
    /// Never return this from the API.
    /// </summary>
    [Required, MaxLength(255)]
    public string Password { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Multi-valued attribute from ERD
    public ICollection<EmployeePhone> Phones { get; set; } = new List<EmployeePhone>();

    // Many-to-many: employees TRACK products
    public ICollection<EmployeeTracks> Tracks { get; set; } = new List<EmployeeTracks>();
}

[Table("EmployeePhone")]
public class EmployeePhone
{
    [MaxLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    public int EmployeeID { get; set; }
    public Employee? Employee { get; set; }
}
