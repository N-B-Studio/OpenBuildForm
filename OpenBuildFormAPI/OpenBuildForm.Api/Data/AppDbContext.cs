using Microsoft.EntityFrameworkCore;


namespace OpenBuildForm.Api.Data
{

    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<Template> Templates => Set<Template>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Template>(entity =>
            {
                entity.ToTable("template");

                entity.HasKey(x => x.Id);

                entity.Property(x => x.Id)
                    .HasColumnName("id");

                entity.Property(x => x.OwnerUserId)
                    .HasColumnName("owner_user_id");

                entity.Property(x => x.Name)
                    .HasColumnName("name");

                entity.Property(x => x.Slug)
                    .HasColumnName("slug");

                entity.Property(x => x.Description)
                    .HasColumnName("description");

                entity.Property(x => x.TemplateStatusId)
                    .HasColumnName("template_status_id");

                entity.Property(x => x.CurrentVersion)
                    .HasColumnName("current_version");

                entity.Property(x => x.CreatedAt)
                    .HasColumnName("created_at");

                entity.Property(x => x.UpdatedAt)
                    .HasColumnName("updated_at");

                entity.Property(x => x.PublishedAt)
                    .HasColumnName("published_at");
            });
        }
    }
}
