namespace GreenGrow.Api.Dtos;

// ---- Product Category ----
public record CategoryDto(int CategoryID, string CategoryName);
public record CategoryCreateDto(string CategoryName);

// ---- Product ----
public record ProductDto(
    int ProductID,
    string ProductName,
    string? ProductDescription,
    decimal ProductCost,
    int Quantity,
    int CategoryID,
    string? CategoryName);

public record ProductCreateDto(
    string ProductName,
    string? ProductDescription,
    decimal ProductCost,
    int Quantity,
    int CategoryID);

// ---- User ----
public record UserDto(
    int UserID,
    string Fname,
    string Lname,
    IEnumerable<string> Emails,
    IEnumerable<string> Phones);

public record UserCreateDto(
    string Fname,
    string Lname,
    string Password,
    IEnumerable<string>? Emails,
    IEnumerable<string>? Phones);

/// <summary>
/// Customer-initiated profile edit. Password is optional so the customer can
/// update name/emails/phones without rotating their password.
/// </summary>
public record UserProfileUpdateDto(
    string Fname,
    string Lname,
    string? Password,
    IEnumerable<string>? Emails,
    IEnumerable<string>? Phones);

// ---- Employee ----
public record EmployeeDto(
    int EmployeeID,
    string Fname,
    string Lname,
    string JobPosition,
    IEnumerable<string> Phones);

public record EmployeeCreateDto(
    string Fname,
    string Lname,
    string JobPosition,
    string Password,
    IEnumerable<string>? Phones);

// ---- Order ----
public record OrderLineDto(
    int ProductID,
    string? ProductName,
    int Quantity,
    decimal LineTotal);

public record OrderDto(
    int OrderID,
    DateTime OrderDate,
    decimal OrderTotal,
    string OrderConfirmation,
    int UserID,
    IEnumerable<OrderLineDto> Lines);

public record OrderLineCreateDto(int ProductID, int Quantity);

public record OrderCreateDto(
    int UserID,
    IEnumerable<OrderLineCreateDto> Lines);
