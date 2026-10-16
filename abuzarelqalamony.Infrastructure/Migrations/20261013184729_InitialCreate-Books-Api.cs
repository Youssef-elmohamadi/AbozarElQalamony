using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace abuzarelqalamony.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateBooksApi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "FilePath",
                table: "Books",
                newName: "PdfFilePath");

            migrationBuilder.RenameColumn(
                name: "Author",
                table: "Books",
                newName: "AuthorName");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Books",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishDate",
                table: "Books",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishDate",
                table: "Books");

            migrationBuilder.RenameColumn(
                name: "PdfFilePath",
                table: "Books",
                newName: "FilePath");

            migrationBuilder.RenameColumn(
                name: "AuthorName",
                table: "Books",
                newName: "Author");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Books",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000,
                oldNullable: true);
        }
    }
}
