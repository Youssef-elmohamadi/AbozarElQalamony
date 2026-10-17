using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace abuzarelqalamony.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBookReaderFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "FileSizeInMB",
                table: "Books",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PagesCount",
                table: "Books",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TableOfContentsJson",
                table: "Books",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileSizeInMB",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "PagesCount",
                table: "Books");

            migrationBuilder.DropColumn(
                name: "TableOfContentsJson",
                table: "Books");
        }
    }
}
