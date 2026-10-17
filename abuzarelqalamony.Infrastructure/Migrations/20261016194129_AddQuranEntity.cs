using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace abuzarelqalamony.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddQuranEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Qurans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    AudioFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    VideoFilePath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ThumbnailPath = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DurationInMinutes = table.Column<int>(type: "int", nullable: true),
                    SurahNumber = table.Column<int>(type: "int", nullable: true),
                    SurahName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    PublishDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CategoryId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Qurans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Qurans_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Qurans_CategoryId",
                table: "Qurans",
                column: "CategoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Qurans");
        }
    }
}
