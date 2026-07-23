namespace OpenBuildForm.Api.Entities
{
    public class TemplateEntity
    {
        public Guid Id { get; set; }

        public Guid OwnerUserId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }

        public short TemplateStatusId { get; set; }

        public int CurrentVersion { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime? PublishedAt { get; set; }
    }
}
