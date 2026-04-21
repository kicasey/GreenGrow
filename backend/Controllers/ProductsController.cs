using GreenGrow.Api.Data;
using GreenGrow.Api.Dtos;
using GreenGrow.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public ProductsController(GreenGrowContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<ProductDto>> Get([FromQuery] int? categoryId = null)
    {
        var q = _db.Products.Include(p => p.Category).AsQueryable();
        if (categoryId is not null) q = q.Where(p => p.CategoryID == categoryId);

        return await q.Select(p => new ProductDto(
                p.ProductID, p.ProductName, p.ProductDescription,
                p.ProductCost, p.Quantity, p.CategoryID,
                p.Category!.CategoryName))
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetOne(int id)
    {
        var p = await _db.Products.Include(x => x.Category)
            .FirstOrDefaultAsync(x => x.ProductID == id);
        if (p is null) return NotFound();
        return new ProductDto(p.ProductID, p.ProductName, p.ProductDescription,
            p.ProductCost, p.Quantity, p.CategoryID, p.Category?.CategoryName);
    }

    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(ProductCreateDto dto)
    {
        var p = new Product
        {
            ProductName = dto.ProductName,
            ProductDescription = dto.ProductDescription,
            ProductCost = dto.ProductCost,
            Quantity = dto.Quantity,
            CategoryID = dto.CategoryID,
        };
        _db.Products.Add(p);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = p.ProductID },
            new ProductDto(p.ProductID, p.ProductName, p.ProductDescription,
                p.ProductCost, p.Quantity, p.CategoryID, null));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, ProductCreateDto dto)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();
        p.ProductName = dto.ProductName;
        p.ProductDescription = dto.ProductDescription;
        p.ProductCost = dto.ProductCost;
        p.Quantity = dto.Quantity;
        p.CategoryID = dto.CategoryID;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.Products.FindAsync(id);
        if (p is null) return NotFound();
        _db.Products.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
