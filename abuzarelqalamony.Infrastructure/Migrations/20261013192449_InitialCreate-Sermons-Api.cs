using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace abuzarelqalamony.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateSermonsApi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Sermons");

            migrationBuilder.RenameColumn(
                name: "SermonDate",
                table: "Sermons",
                newName: "KhutbahDate");

            migrationBuilder.RenameColumn(
                name: "MediaPath",
                table: "Sermons",
                newName: "VideoFilePath");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sermons",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AudioFilePath",
                table: "Sermons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PublishDate",
                table: "Sermons",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AudioFilePath",
                table: "Sermons");

            migrationBuilder.DropColumn(
                name: "PublishDate",
                table: "Sermons");

            migrationBuilder.RenameColumn(
                name: "VideoFilePath",
                table: "Sermons",
                newName: "MediaPath");

            migrationBuilder.RenameColumn(
                name: "KhutbahDate",
                table: "Sermons",
                newName: "SermonDate");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "Sermons",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Duration",
                table: "Sermons",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);
        }
    }
}
