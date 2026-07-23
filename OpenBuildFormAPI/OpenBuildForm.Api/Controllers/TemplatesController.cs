using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OpenBuildForm.Api.Data;

namespace OpenBuildForm.Api.Controllers
{

    [ApiController]
    [Route("api/templates")]
    public class TemplatesController : ControllerBase
    {
        private readonly AppDbContext _db;

        public TemplatesController(AppDbContext db)
        {
            _db = db;
        }

        // GET /api/templates
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Template>>> GetAll(
            [FromQuery] string? name = null)
        {
            var query = _db.Templates.AsQueryable();

            if (!string.IsNullOrWhiteSpace(name))
            {
                query = query.Where(x =>
                    EF.Functions.ILike(x.Name, $"%{name.Trim()}%"));
            }

            var templates = await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();

            return Ok(templates);
        }

        // GET /api/templates/{id}
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<Template>> Get(Guid id)
        {
            var template = await _db.Templates.FindAsync(id);

            if (template is null)
                return NotFound();

            return Ok(template);
        }

        // POST /api/templates
        [HttpPost]
        public async Task<ActionResult<Template>> Create(
            CreateTemplateRequest request)
        {
            var template = new Template
            {
                Id = Guid.NewGuid(),

                // Dummy until Entra External ID is connected
                OwnerUserId = request.OwnerUserId,

                Name = request.Name,
                Slug = request.Slug,
                Description = request.Description,

                TemplateStatusId = 1,
                CurrentVersion = 1,

                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _db.Templates.Add(template);

            await _db.SaveChangesAsync();

            return CreatedAtAction(
                nameof(Get),
                new { id = template.Id },
                template);
        }

        // PUT /api/templates/{id}
        [HttpPut("{id:guid}")]
        public async Task<ActionResult<Template>> Update(
            Guid id,
            UpdateTemplateRequest request)
        {
            var template = await _db.Templates.FindAsync(id);

            if (template is null)
                return NotFound();

            template.Name = request.Name;
            template.Slug = request.Slug;
            template.Description = request.Description;
            template.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(template);
        }

        // DELETE /api/templates/{id}
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var template = await _db.Templates.FindAsync(id);

            if (template is null)
                return NotFound();

            _db.Templates.Remove(template);

            await _db.SaveChangesAsync();

            return NoContent();
        }
    }

    public record CreateTemplateRequest(
        Guid OwnerUserId,
        string Name,
        string Slug,
        string? Description);

    public record UpdateTemplateRequest(
        string Name,
        string Slug,
        string? Description);
}