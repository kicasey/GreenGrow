using GreenGrow.Api.Data;
using GreenGrow.Api.Dtos;
using GreenGrow.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public CategoriesController(GreenGrowContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<CategoryDto>> Get() =>
        await _db.ProductCategories
            .Select(c => new CategoryDto(c.CategoryID, c.CategoryName))
            .ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryDto>> GetOne(int id)
    {
        var c = await _db.ProductCategories.FindAsync(id);
        return c is null ? NotFound() : new CategoryDto(c.CategoryID, c.CategoryName);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDto>> Create(CategoryCreateDto dto)
    {
        var entity = new ProductCategory { CategoryName = dto.CategoryName };
        _db.ProductCategories.Add(entity);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = entity.CategoryID },
            new CategoryDto(entity.CategoryID, entity.CategoryName));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, CategoryCreateDto dto)
    {
        var c = await _db.ProductCategories.FindAsync(id);
        if (c is null) return NotFound();
        c.CategoryName = dto.CategoryName;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var c = await _db.ProductCategories.FindAsync(id);
        if (c is null) return NotFound();
        _db.ProductCategories.Remove(c);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
