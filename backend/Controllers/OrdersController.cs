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

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var o = await _db.Orders.FindAsync(id);
        if (o is null) return NotFound();
        _db.Orders.Remove(o);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
