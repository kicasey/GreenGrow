using GreenGrow.Api.Data;
using GreenGrow.Api.Dtos;
using GreenGrow.Api.Models;
using GreenGrow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GreenGrow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly GreenGrowContext _db;
    public EmployeesController(GreenGrowContext db) => _db = db;

    [HttpGet]
    public async Task<IEnumerable<EmployeeDto>> Get() =>
        await _db.Employees
            .Include(e => e.Phones)
            .Select(e => new EmployeeDto(
                e.EmployeeID, e.Fname, e.Lname, e.JobPosition,
                e.Phones.Select(p => p.PhoneNumber)))
            .ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDto>> GetOne(int id)
    {
        var e = await _db.Employees
            .Include(x => x.Phones)
            .FirstOrDefaultAsync(x => x.EmployeeID == id);
        if (e is null) return NotFound();
        return new EmployeeDto(e.EmployeeID, e.Fname, e.Lname, e.JobPosition,
            e.Phones.Select(p => p.PhoneNumber));
    }

    [HttpPost]
    public async Task<ActionResult<EmployeeDto>> Create(EmployeeCreateDto dto)
    {
        // Teacher feedback: Employee.Password is now required — and it is HASHED.
        var e = new Employee
        {
            Fname = dto.Fname,
            Lname = dto.Lname,
            JobPosition = dto.JobPosition,
            Password = PasswordService.Hash(dto.Password),
            Phones = (dto.Phones ?? Array.Empty<string>())
                .Select(p => new EmployeePhone { PhoneNumber = p }).ToList(),
        };
        _db.Employees.Add(e);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOne), new { id = e.EmployeeID },
            new EmployeeDto(e.EmployeeID, e.Fname, e.Lname, e.JobPosition,
                e.Phones.Select(p => p.PhoneNumber)));
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, EmployeeCreateDto dto)
    {
        var e = await _db.Employees
            .Include(x => x.Phones)
            .FirstOrDefaultAsync(x => x.EmployeeID == id);
        if (e is null) return NotFound();

        e.Fname = dto.Fname;
        e.Lname = dto.Lname;
        e.JobPosition = dto.JobPosition;
        if (!string.IsNullOrWhiteSpace(dto.Password))
            e.Password = PasswordService.Hash(dto.Password);

        _db.EmployeePhones.RemoveRange(e.Phones);
        e.Phones = (dto.Phones ?? Array.Empty<string>())
            .Select(p => new EmployeePhone { PhoneNumber = p, EmployeeID = id }).ToList();

        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var e = await _db.Employees.FindAsync(id);
        if (e is null) return NotFound();
        _db.Employees.Remove(e);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
