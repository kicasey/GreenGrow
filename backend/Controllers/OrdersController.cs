using GreenGrow.Api.Data;
using GreenGrow.Api.Dtos;
using GreenGrow.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public OrdersController(GreenGrowContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<OrderDto>> Get() =>
        await _db.Orders
            .Include(o => o.Lines).ThenInclude(l => l.Product)
            .Select(o => new OrderDto(
                o.OrderID, o.OrderDate, o.OrderTotal, o.OrderConfirmation, o.UserID,
                o.Lines.Select(l => new OrderLineDto(
                    l.ProductID, l.Product!.ProductName, l.Quantity, l.LineTotal))))
            .ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderDto>> GetOne(int id)
    {
        var o = await _db.Orders
            .Include(x => x.Lines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(x => x.OrderID == id);
        if (o is null) return NotFound();
        return new OrderDto(o.OrderID, o.OrderDate, o.OrderTotal, o.OrderConfirmation, o.UserID,
            o.Lines.Select(l => new OrderLineDto(
                l.ProductID, l.Product?.ProductName, l.Quantity, l.LineTotal)));
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(OrderCreateDto dto)
    {
        var productIds = dto.Lines.Select(l => l.ProductID).ToList();
        var products = await _db.Products
            .Where(p => productIds.Contains(p.ProductID))
            .ToDictionaryAsync(p => p.ProductID);

        var lines = new List<OrderContains>();
        decimal total = 0m;
        foreach (var line in dto.Lines)
        {
            if (!products.TryGetValue(line.ProductID, out var prod))
                return BadRequest($"Product {line.ProductID} not found.");
            if (line.Quantity <= 0)
                return BadRequest("Quantity must be greater than zero.");
            if (prod.Quantity < line.Quantity)
                return BadRequest($"Not enough stock for {prod.ProductName} (only {prod.Quantity} left).");
            decimal lineTotal = prod.ProductCost * line.Quantity;
            total += lineTotal;
            lines.Add(new OrderContains
            {
                ProductID = line.ProductID,
                Quantity = line.Quantity,   // Teacher feedback: Quantity on CONTAINS
                LineTotal = lineTotal,
            });

            // Decrement inventory so on-hand reflects what was sold.
            prod.Quantity -= line.Quantity;
        }

        var order = new Order
        {
            UserID = dto.UserID,
            OrderTotal = total,
            OrderConfirmation = $"GG-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}",
            Lines = lines,
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetOne), new { id = order.OrderID },
            new OrderDto(order.OrderID, order.OrderDate, order.OrderTotal,
                order.OrderConfirmation, order.UserID,
                order.Lines.Select(l => new OrderLineDto(
                    l.ProductID,
                    products.TryGetValue(l.ProductID, out var p) ? p.ProductName : null,
                    l.Quantity, l.LineTotal))));
    }

    /// <summary>
    /// Customer-initiated order cancellation. Only allowed if:
    ///   - The order belongs to the user making the request (userId query param)
    ///   - The order was placed less than 24 hours ago
    /// Restores each product's stock by the quantity sold, then removes the
    /// order. OrderContains rows cascade via EF relationship config.
    /// </summary>
    [HttpPost("{id:int}/cancel")]
    public async Task<IActionResult> Cancel(int id, [FromQuery] int userId)
    {
        var order = await _db.Orders
            .Include(o => o.Lines).ThenInclude(l => l.Product)
            .FirstOrDefaultAsync(o => o.OrderID == id);
        if (order is null) return NotFound();

        if (order.UserID != userId)
            return Forbid();

        // OrderDate is stored in UTC (default current_timestamp at insert + UtcNow on Create).
        var ageHours = (DateTime.UtcNow - order.OrderDate).TotalHours;
        if (ageHours > 24)
            return BadRequest("Orders can only be cancelled within 24 hours of being placed.");

        foreach (var line in order.Lines)
        {
            if (line.Product is not null)
                line.Product.Quantity += line.Quantity;
        }

        _db.OrderContains.RemoveRange(order.Lines);
        _db.Orders.Remove(order);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var o = await _db.Orders
            .Include(x => x.Lines)
            .FirstOrDefaultAsync(x => x.OrderID == id);
        if (o is null) return NotFound();
        _db.OrderContains.RemoveRange(o.Lines);
        _db.Orders.Remove(o);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
